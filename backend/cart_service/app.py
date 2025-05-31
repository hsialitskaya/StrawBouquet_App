from flask import Flask, request, jsonify, url_for, send_from_directory, current_app
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_bcrypt import Bcrypt
from db import db
from models import Users, Cart 
import os
from werkzeug.utils import secure_filename
from keycloak import KeycloakOpenID
from functools import wraps
import redis
import json
import requests
import logging


app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:3001"}},
    supports_credentials=True,
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"], 
    expose_headers=["Authorization"], 
    methods=["GET", "POST", "PUT", "DELETE"]
)

# Konfiguracja bazy danych PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:haslo@postgres:5432/myapp_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Konfiguracja PRODUCT_SERVICE
app.config['PRODUCT_SERVICE_URL'] = os.environ.get('PRODUCT_SERVICE_URL', 'http://backend-produkt:5001')

# Inicjalizacja narzędzi
db.init_app(app)
bcrypt = Bcrypt(app)
limiter = Limiter(app=app, key_func=get_remote_address)

keycloak_openid = KeycloakOpenID(
    server_url="http://keycloak:8080/auth",
    client_id="myclient",
    realm_name="myrealm"
)

# realm_url = "http://keycloak:8080/realms/myrealm"
# response = requests.get(realm_url)
# public_key_raw = response.json()['public_key']
# public_key = f"-----BEGIN PUBLIC KEY-----\n{public_key_raw}\n-----END PUBLIC KEY-----"


# Inicjalizacja klienta Redis
redis_client = redis.Redis(
    host='redis',
    port=6379,
    db=0,
    decode_responses=True
)

@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Pobierz token z nagłówka autoryzacji
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token is missing"}), 403

        # Usuń "Bearer " z tokena
        token = token.split(" ")[1]

        try:
            # Zdekoduj token i sprawdź
            token_info = keycloak_openid.decode_token(token)

            client_id = token_info.get('azp')
            if client_id != "myclient":
                return jsonify({"error": "Unauthorized client"}), 403

        except Exception as e:
            return jsonify({"error": "Token is invalid", "message": str(e)}), 403

        # Przekazujemy userinfo jako argument
        return f(userinfo=token_info, *args, **kwargs)

    return decorated_function


# Rejestracja użytkownika
@app.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.json

    # Walidacja danych wejściowych
    required_fields = ['email', 'nickname']
    if not data or any(field not in data for field in required_fields):
        return jsonify({'message': 'Niekompletne dane rejestracji'}), 400

    # Sprawdzenie, czy email już istnieje w bazie
    if Users.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Użytkownik o tym emailu już istnieje'}), 400
    # Sprawdzenie, czy nickname już istnieje w bazie
    if Users.query.filter_by(nickname=data['nickname']).first():
        return jsonify({'message': 'Użytkownik o tym nicku już istnieje'}), 400

    # Rejestracja użytkownika
    new_user = Users(
        email=data['email'],
        nickname=data['nickname']
        )

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'Rejestracja zakończona sukcesem!', 'success': True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Wystąpił błąd podczas rejestracji.'}), 500



# Dodawanie bukietu do koszyka
@app.route('/cart', methods=['POST'])
@token_required
def add_to_cart(userinfo):
    try:
        current_user_email = userinfo.get('email')

        if not current_user_email:
            return jsonify({'message': 'Email nie znaleziony w tokenie'}), 400

        user = Users.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'message': 'Użytkownik nie znaleziony'}), 404

        data = request.get_json()
        bouquet_id = data.get('bouquet_id')
        if not bouquet_id:
            return jsonify({'message': 'Brak identyfikatora bukietu'}), 400

         # Pobranie bukietu z serwisu produktów
        product_service_url = f"{current_app.config['PRODUCT_SERVICE_URL']}/bouquet/{bouquet_id}"
        resp = requests.get(product_service_url)
        if resp.status_code != 200:
            return jsonify({'message': 'Bukiet nie znaleziony w serwisie produktów'}), 404
        bouquet_data = resp.json()

    
        # Sprawdzenie, czy bukiet już jest w koszyku
        cart_item = Cart.query.filter_by(user_id=user.id, bouquet_id=bouquet_id).first()

        if cart_item:
            # Jeśli bukiet już jest w koszyku, zwiększamy ilość
            cart_item.quantity += 1
        else:
            # Jeśli bukiet nie jest w koszyku, dodajemy go
            cart_item = Cart(user_id=user.id, bouquet_id=bouquet_id)
            db.session.add(cart_item)

        db.session.commit()
        return jsonify({'message': 'Bukiet dodany do koszyka', 'success': True}), 201

    except Exception as e:
        return jsonify({'message': 'Wystąpił błąd'}), 500


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Pobieranie zawartośći koszyka
@app.route('/cart', methods=['GET'])
@token_required
def get_cart(userinfo):
    try:
        current_user_email = userinfo.get('email')
        if not current_user_email:
            logger.warning("Email nie znaleziony w tokenie")
            return jsonify({'message': 'Email nie znaleziony w tokenie'}), 400

        logger.info(f"Pobieranie koszyka dla użytkownika: {current_user_email}")

        user = Users.query.filter_by(email=current_user_email).first()
        if not user:
            logger.warning(f"Użytkownik z emailem {current_user_email} nie znaleziony")
            return jsonify({'message': 'Użytkownik nie znaleziony'}), 404

        cart_items = Cart.query.filter_by(user_id=user.id).all()
        logger.info(f"Znaleziono {len(cart_items)} produktów w koszyku użytkownika {user.id}")

        cart_data = []
        for item in cart_items:
            if not item.bouquet_id:
                logger.warning(f"Brak bouquet_id w itemie ID: {item.id}")
                continue

            product_service_url = f"{current_app.config['PRODUCT_SERVICE_URL']}/bouquet/{item.bouquet_id}"
            try:
                logger.debug(f"Pobieranie danych bukietu z: {product_service_url}")
                resp = requests.get(product_service_url, timeout=3)
                resp.raise_for_status()
                bouquet = resp.json()

                logger.info(f"Załadowano dane bukietu ID: {bouquet.get('id')}")

                cart_data.append({
                    "bouquet_id": bouquet.get('id'),
                    "bouquet_name": bouquet.get('name'),
                    "bouquet_price": bouquet.get('price'),
                    "bouquet_image": bouquet.get('image_url'),
                    "quantity": item.quantity
                })

            except requests.exceptions.RequestException as req_err:
                logger.error(f"Błąd pobierania bukietu {item.bouquet_id}: {req_err}")
                continue

        logger.info(f"Zwrócono koszyk z {len(cart_data)} produktami")
        return jsonify(cart_data), 200

    except Exception as e:
        logger.exception("Wystąpił błąd podczas pobierania koszyka")
        return jsonify({'message': 'Wystąpił błąd'}), 500


# Aktualizacji ilości elementów w koszyku
@app.route('/cart/<int:cart_item_id>', methods=['PUT'])
@token_required
def update_cart(cart_item_id, userinfo):
    try:
        current_user_email = userinfo.get('email')
        if not current_user_email:
            return jsonify({'message': 'Błąd autoryzacji'}), 400

        user = Users.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'message': 'Błąd autoryzacji'}), 404

        # Pobranie pozycji w koszyku
        cart_item = Cart.query.filter_by(bouquet_id=cart_item_id, user_id=user.id).first()
        if not cart_item:
            return jsonify({'message': 'Element nie istnieje'}), 404

        # Zaktualizowanie ilości
        data = request.json
        new_quantity = data.get('quantity')
        if new_quantity < 1:
            return jsonify({'message': 'Nieprawidłowa ilość'}), 400

        cart_item.quantity = new_quantity
        db.session.commit()
        return jsonify({'message': 'Ilość w koszyku zaktualizowana'}), 200

    except Exception as e:
        return jsonify({'message': 'Wystąpił błąd'}), 500


# Usuwanie bukietu z koszyka
@app.route('/cart/<int:cart_item_id>', methods=['DELETE'])
@token_required
def remove_from_cart(cart_item_id, userinfo):
    try:
        current_user_email = userinfo.get('email')
        if not current_user_email:
            return jsonify({'message': 'Email nie znaleziony w tokenie'}), 400

        user = Users.query.filter_by(email=current_user_email).first()
        if not user:
            return jsonify({'message': 'Użytkownik nie znaleziony'}), 404

        cart_item = Cart.query.filter_by(bouquet_id=cart_item_id, user_id=user.id).first()
        if not cart_item:
            return jsonify({'message': 'Item not found'}), 404

        db.session.delete(cart_item)  # Usuwanie elementu
        db.session.commit()
        return jsonify({'message': 'Bukiet usunięty z koszyka'}), 200

    except Exception as e:
        return jsonify({'message': 'Wystąpił błąd'}), 500


@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200

# Tworzenie tabel w bazie danych
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=True) 
