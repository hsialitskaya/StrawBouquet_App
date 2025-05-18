import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBouquets, deleteBouquet } from "./api";
import { useAuth } from "./AuthContext";
import errorImage from "./assets/error.jpeg";

function DeleteBouquet() {
  const [bouquets, setBouquets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const bouquetsPerPage = 10;

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const loadBouquets = async () => {
      try {
        const data = await fetchBouquets();
        setBouquets(data);
      } catch (error) {
        setError("Błąd pobierania bukietów. Spróbuj ponownie później.");
      } finally {
        setLoading(false);
      }
    };

    loadBouquets();
  }, []);

  const handleDeleteBouquet = async (bouquetId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten bukiet?")) {
      return;
    }
    setDeletingId(bouquetId);
    try {
      await deleteBouquet(bouquetId);
      const data = await fetchBouquets();
      setBouquets(data);
      setSuccess("Bukiet został usunięty!");
    } catch (error) {
      setError("Błąd usuwania buketu z bazy.");
    } finally {
      setDeletingId(null);
    }
  };

  const indexOfLastBouquet = currentPage * bouquetsPerPage;
  const indexOfFirstBouquet = indexOfLastBouquet - bouquetsPerPage;
  const currentBouquets = bouquets.slice(
    indexOfFirstBouquet,
    indexOfLastBouquet
  );

  const totalPages = Math.ceil(bouquets.length / bouquetsPerPage);

  if (loading) {
    return <div>Ładowanie bukietów...</div>;
  }

  return (
    <div>
      <h2>Bukiety</h2>
      {success && (
        <div style={{ color: "green", textAlign: "center" }}>{success}</div>
      )}
      {error && (
        <div style={{ color: "red", textAlign: "center" }}>{error}</div>
      )}
      <div
        className="bouquet-container"
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
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
            <button
              onClick={() => handleDeleteBouquet(bouquet.id)}
              disabled={deletingId === bouquet.id}
            >
              {deletingId === bouquet.id ? "Usuwanie..." : "Usuń z bazy"}
            </button>
          </div>
        ))}
      </div>
      <div className="pagination-container" style={{ marginLeft: "44%" }}>
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

export default DeleteBouquet;
