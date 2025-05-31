from db import db

# Model buketów
class Bouquet(db.Model):
    __tablename__ = 'bouquet'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255), nullable=True, default=None)

    def __init__(self, name, price, image_url=None):
        if price <= 0:
            raise ValueError("Price must be greater than zero.")
        self.name = name
        self.price = price
        self.image_url = image_url

    def __repr__(self):
        return f"<Bouquet {self.name}>"