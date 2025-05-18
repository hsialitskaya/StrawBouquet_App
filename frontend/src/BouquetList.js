import React, { useState, useEffect } from "react";
import { fetchBouquets, addToCart } from "./api";
import errorImage from "./assets/error.jpeg";

function FallingStrawberriesAndBouquets() {
  useEffect(() => {
    // Funkcja do generowania truskawek
    const createItem = () => {
      const item = document.createElement("div");

      // Losowanie, czy dodajemy truskawkę czy bukiet
      const randomItem = Math.random() < 0.5 ? "🍓" : "💐"; // 50% na truskawkę lub bukiet
      item.textContent = randomItem;
      item.classList.add("falling-item");

      // Losowanie pozycji początkowej w poziomie (w skali 0-100%)
      const randomLeft = Math.random() * 100;
      item.style.left = `${randomLeft}%`; // Przypisanie losowej pozycji w poziomie

      // Dodajemy truskawkę do body
      document.body.appendChild(item);

      // Usuwamy truskawkę po zakończeniu animacji (po 3 sekundach)
      setTimeout(() => {
        item.remove();
      }, 3000); // Usuwamy po 3 sekundach
    };

    // Tworzymy truskawki tylko przez 3 sekundy
    const interval = setInterval(() => {
      createItem();
    }, 200); // Dodawanie truskawek co 200ms

    // Po 3 sekundach zatrzymujemy dodawanie truskawek
    setTimeout(() => {
      clearInterval(interval);
    }, 3000);

    // Czyszczenie interwału i usuwanie truskawek, gdy komponent jest odmontowany
    return () => {
      clearInterval(interval); // Upewniamy się, że interwał jest usunięty
      // Usuwamy wszystkie truskawki, jeśli komponent jest usuwany
      const allStrawberries = document.querySelectorAll(".falling-item");
      allStrawberries.forEach((item) => item.remove());
    };
  }, []);

  return null; // Komponent nie renderuje nic w DOM
}

function BouquetList() {
  const [bouquets, setBouquets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bouquetsPerPage = 10;

  useEffect(() => {
    const loadBouquets = async () => {
      try {
        const data = await fetchBouquets();
        setBouquets(data);
      } catch (error) {
        console.error("Błąd podczas ładowania bukietów:", error);
        setError("Błąd pobierania bukietów. Spróbuj ponownie później.");
      } finally {
        setLoading(false);
      }
    };

    loadBouquets();
  }, []);

  const handleAddToCart = async (bouquetId) => {
    try {
      const response = await addToCart(bouquetId);
      if (response.success) {
        setSuccess(response.message);
      } else {
        setError("Nie udało się dodać bukietu do koszyka. Spróbuj ponownie.");
      }
    } catch (error) {
      console.error("Błąd podczas dodawania do koszyka:", error);
      setError("Błąd dodawania do koszyka");
      setSuccess("");
    }
  };

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && value >= 0)) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(value) && value >= 0)) {
      setMaxPrice(value);
    }
  };

  const filteredBouquets = bouquets.filter((bouquet) => {
    return (
      (!selectedSize || bouquet.name.includes(selectedSize)) &&
      (!minPrice || bouquet.price >= parseFloat(minPrice)) &&
      (!maxPrice || bouquet.price <= parseFloat(maxPrice))
    );
  });

  const indexOfLastBouquet = currentPage * bouquetsPerPage;
  const indexOfFirstBouquet = indexOfLastBouquet - bouquetsPerPage;
  const currentBouquets = filteredBouquets.slice(
    indexOfFirstBouquet,
    indexOfLastBouquet
  );

  const totalPages = Math.ceil(filteredBouquets.length / bouquetsPerPage);

  if (loading) {
    return <div>Ładowanie bukietów...</div>;
  }

  return (
    <div className="centered-container">
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <h2>Nasze Bukiety</h2>
          {success && (
            <div style={{ color: "green", textAlign: "center" }}>{success}</div>
          )}
          {error && (
            <div style={{ color: "red", textAlign: "center" }}>{error}</div>
          )}
          <div className="bouquet-container">
            {currentBouquets.map((bouquet) => (
              <div key={bouquet.id} className="bouquet-card">
                <img
                  src={`http://127.0.0.1:5001${bouquet.image_url}`}
                  alt={bouquet.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = errorImage;
                  }}
                />
                <h3>{bouquet.name}</h3>
                <p>Cena: {bouquet.price} PLN</p>
                <button onClick={() => handleAddToCart(bouquet.id)}>
                  Dodaj do koszyka
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: "250px", padding: "20px" }}>
          <div
            className="filters"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label>Rozmiar: </label>
            <select onChange={(e) => setSelectedSize(e.target.value)}>
              <option value="">Wszystkie</option>
              <option value="Mały">Mały</option>
              <option value="Średni">Średni</option>
              <option value="Duży">Duży</option>
              <option value="Ekstra duży">Ekstra duży</option>
            </select>

            <label>Cena od: </label>
            <input
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
            />
            <label>Cena do: </label>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
            />
          </div>
        </div>
        <FallingStrawberriesAndBouquets />
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
    </div>
  );
}

export default BouquetList;
