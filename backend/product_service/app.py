from flask import Flask, request, jsonify, url_for, send_from_directory, current_app
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_bcrypt import Bcrypt
from db import db
from models import Bouquet
import os
from werkzeug.utils import secure_filename
from keycloak import KeycloakOpenID
from functools import wraps
import redis
import json
import requests


app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:3001", "http://backend-cart:5002"]}},
    supports_credentials=True,
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"], 
    expose_headers=["Authorization"], 
    methods=["GET", "POST", "PUT", "DELETE"]
)

# Konfiguracja bazy danych PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:haslo@postgres:5432/myapp_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Foldery do uploadu plików
UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

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
            # Introspekcja tokena — zapytanie do Keycloak
            token_info = keycloak_openid.introspect(token)

            if not token_info.get("active"):
                return jsonify({"error": "Token is inactive or expired"}), 403

            client_id = token_info.get('azp')
            if client_id != "myclient":
                return jsonify({"error": "Unauthorized client"}), 403

        except Exception as e:
            return jsonify({"error": "Token is invalid", "message": str(e)}), 403

        # Przekazujemy userinfo jako argument
        return f(userinfo=token_info, *args, **kwargs)

    return decorated_function

def roles_required(*required_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(userinfo=None, *args, **kwargs):
            if not userinfo:
                return jsonify({"error": "No user info found"}), 403

            user_roles = userinfo.get('realm_access', {}).get('roles', [])
            if not any(role in user_roles for role in required_roles):
                return jsonify({"error": "Access denied"}), 403

            return f(userinfo=userinfo, *args, **kwargs)

        return decorated_function
    return decorator



@app.route('/bouquets', methods=['GET'])
def get_bouquets():
    cache_key = 'all_bouquets'

    # Sprawdź, czy dane są w cache
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return jsonify(json.loads(cached_data))

    # Jeśli nie ma w cache, pobierz z bazy
    bouquets = Bouquet.query.all()
    bouquets_data = [
        {
            "id": bouquet.id,
            "name": bouquet.name,
            "price": bouquet.price,
            "image_url": url_for('uploaded_file', filename=bouquet.image_url.split('/')[-1]),
        }
        for bouquet in bouquets
    ]

    # Zapisz w cache na 5 minut (300 sekund)
    redis_client.setex(cache_key, 300, json.dumps(bouquets_data))

    return jsonify(bouquets_data), 200


@app.route('/bouquet/<int:bouquet_id>', methods=['GET'])
def get_single_bouquet(bouquet_id):
    bouquet = Bouquet.query.get(bouquet_id)
    if not bouquet:
        return jsonify({"message": "Bukiet nie znaleziony"}), 404
        
    return jsonify({
        "id": bouquet.id,
        "name": bouquet.name,
        "price": bouquet.price,
        "image_url": url_for('uploaded_file', filename=bouquet.image_url.split('/')[-1])
    }), 200

# Funkcja do sprawdzania formatu pliku
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Trasa do udostępniania obrazów
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# Dodanie buketu do bazy danych
@app.route('/add_bouquet', methods=['POST'])
@token_required
@roles_required('admin')
@limiter.limit("10 per minute")
def add_bouquet(userinfo):
    try:
        # Walidacja danych formularza
        if 'name' not in request.form or not request.form['name'].strip():
            return jsonify({'message': 'Nazwa jest wymagana!'}), 400

        if 'price' not in request.form:
            return jsonify({'message': 'Cena jest wymagana!'}), 400

        if 'image' not in request.files:
            return jsonify({'message': 'Zdjęcie jest wymagane!'}), 400

        name = request.form['name'].strip()
        price = request.form['price']
        image = request.files['image']

        if len(name) > 100:
            return jsonify({'message': 'Nazwa może mieć max 100 znaków'}), 400

        # Konwertowanie ceny na float
        try:
            price = float(price)
            if price <= 0:
                raise ValueError
        except ValueError:
            return jsonify({'message': 'Nieprawidłowa cena'}), 400

        # Walidacja pliku
        if not (image and allowed_file(image.filename)):
            return jsonify({'message': 'Nieobsługiwany format pliku'}), 400


        if len(image.read()) > 16 * 1024 * 1024:
            return jsonify({'message': 'Plik jest za duży (max 16MB)'}), 400
        image.seek(0)

        # Sprawdzenie formatu pliku
        if image and allowed_file(image.filename):
            filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

            # Unikanie nadpisania plików - jeśli plik istnieje, dodajemy unikalny sufiks
            counter = 1
            while os.path.exists(image_path):
                filename, ext = os.path.splitext(image.filename)
                new_filename = f"{filename}_{counter}{ext}"
                image_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
                counter += 1

        else:
            return jsonify({'message': 'Nieprawidłowy format pliku'}), 400

        try:
            image.save(image_path)
            new_bouquet = Bouquet(
                name=name,
                price=price,
                image_url=image_path
            )

            db.session.add(new_bouquet)
            db.session.commit()

            # Usuń cache, aby następne żądanie pobrało świeże dane
            redis_client.delete('all_bouquets')

            return jsonify({'message': 'Bukiet został dodany do bazy danych.'}), 201

        except Exception as e:
            db.session.rollback()
            if os.path.exists(image_path):
                os.remove(image_path)
            return jsonify({'message': f'Wewnętrzny błąd serwera: {e}'}), 500

    except Exception as e:
        return jsonify({'message': 'Wewnętrzny błąd serwera'}), 500


# Usuniecie buketu z bazy danych
@app.route('/bouquet/<int:bouquet_id>', methods=['DELETE'])
@token_required
@roles_required('admin')
@limiter.limit("10 per minute")
def delete_bouquet(bouquet_id, userinfo):
    try:
        # Sprawdzenie, czy bukiet istnieje w bazie
        bouquet = Bouquet.query.get(bouquet_id)
        if not bouquet:
            return jsonify({'message': 'Bukiet nie znaleziony'}), 404

        image_path = bouquet.image_url

        # Usuwanie bukietu z bazy danych
        db.session.delete(bouquet)
        db.session.commit()

        # Sprawdzenie, czy żaden inny bukiet nie korzysta z tego samego obrazu
        if image_path:
            other_bouquets_with_same_image_count = Bouquet.query.filter_by(image_url=image_path).count()
            if other_bouquets_with_same_image_count == 0:
                try:
                    full_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))
                    if os.path.exists(full_image_path):
                        os.remove(full_image_path)
                    else:
                        return jsonify({'message': 'Plik nie istnieje'}), 400
                except Exception as e:
                    return jsonify({'message': f'Bukiet usunięty, ale nie udało się usunąć pliku: {str(e)}'}), 500

        # Usuń cache, aby następne żądanie pobrało świeże dane
        redis_client.delete('all_bouquets')

        return jsonify({'message': 'Bukiet został usunięty z bazy danych'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'message': 'Problem z dostępem do danych'}), 503

    except Exception as e:
        return jsonify({'message': 'Wewnętrzny błąd systemu'}), 500



@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200

# Tworzenie tabel w bazie danych
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=True) 
