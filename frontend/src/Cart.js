import React, { useState, useEffect } from "react";
import { fetchCart, updateQuantity, removeFromCart } from "./api";
import errorImage from "./assets/error.jpeg";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bouquetsPerPage = 10;

  useEffect(() => {
    const loadCart = async () => {
      try {
        const data = await fetchCart();
        setCart(data);
      } catch (error) {
        console.error("Błąd pobierania koszyka:", error);
        setError("Błąd pobierania koszyka. Spróbuj ponownie później.");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    setActionLoading(cartItemId);
    try {
      await updateQuantity(cartItemId, newQuantity);
      setCart(
        cart.map((item) =>
          item.bouquet_id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Błąd aktualizacji ilości:", error);
      setError("Błąd aktualizacji ilości. Spróbuj ponownie później.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    setActionLoading(cartItemId);
    try {
      await removeFromCart(cartItemId);
      setCart(cart.filter((item) => item.bouquet_id !== cartItemId));
    } catch (error) {
      console.error("Błąd usuwania z koszyka:", error);
      setError("Błąd usuwania z koszyka. Spróbuj ponownie później.");
    } finally {
      setActionLoading(null);
    }
  };

  const indexOfLastBouquet = currentPage * bouquetsPerPage;
  const indexOfFirstBouquet = indexOfLastBouquet - bouquetsPerPage;
  const currentBouquets = cart.slice(indexOfFirstBouquet, indexOfLastBouquet);

  const totalPages = Math.ceil(cart.length / bouquetsPerPage);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.bouquet_price * item.quantity,
    0
  );

  if (loading) {
    return <div>Ładowanie koszyka...</div>;
  }

  return (
    <div>
      {cart.length === 0 ? (
        <h3>Twój koszyk jest pusty.</h3>
      ) : (
        <>
          <h2>Twój Koszyk</h2>
          {error && (
            <div style={{ color: "red", textAlign: "center" }}>{error}</div>
          )}
          <div className="cart-total">
            <h3>Razem do zapłaty: {cartTotal.toFixed(2)} PLN</h3>
          </div>
          <div className="bouquet-container">
            {currentBouquets.map((item) => (
              <div key={item.bouquet_id} className="bouquet-card">
                <img
                  src={`http://127.0.0.1:5001/${item.bouquet_image}`}
                  alt={item.bouquet_name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = errorImage;
                  }}
                />
                <h3>{item.bouquet_name}</h3>
                <p>Cena za sztukę: {item.bouquet_price} PLN</p>
                <p>Cena łączna: {item.bouquet_price * item.quantity} PLN</p>
                <div className="quantity-control">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.bouquet_id, item.quantity + 1)
                    }
                    disabled={actionLoading === item.bouquet_id}
                  >
                    +
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        handleRemoveFromCart(item.bouquet_id);
                      } else {
                        handleQuantityChange(
                          item.bouquet_id,
                          item.quantity - 1
                        );
                      }
                    }}
                    disabled={actionLoading === item.bouquet_id}
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination-container">
            {currentPage > 1 && (
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                «
              </button>
            )}

            <button className="pagination-button active">{currentPage}</button>

            {currentPage < totalPages && (
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                »
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
