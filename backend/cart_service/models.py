import sys
import os
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


# Model użytkownika
class Users(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    nickname = db.Column(db.String(50), unique=True, nullable=False)



# Model koszyka
class Cart(db.Model):
    __tablename__ = 'cart'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    bouquet_id = db.Column(db.Integer, db.ForeignKey('bouquet.id', ondelete='CASCADE'), nullable=False)
    quantity = db.Column(db.Integer, default=1)  # Liczba sztuk bukietu

    user = db.relationship('Users', backref=db.backref('cart', lazy=True), passive_deletes=True)
    bouquet = db.relationship('Bouquet', backref=db.backref('cart', lazy=True), passive_deletes=True)
