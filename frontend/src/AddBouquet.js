import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addBouquet } from "./api";
import { useAuth } from "./AuthContext";

function AddBouquet() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !image) {
      setError("Nazwa, cena i zdjęcie są wymagane!");
      return;
    }

    // Sprawdzanie, czy cena jest liczbą
    if (isNaN(price) || price <= 0) {
      setError("Cena musi być liczbą większą od 0");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(image.type)) {
      setError("Dozwolone formaty to JPG i PNG.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxFileSize) {
      setError("Maksymalny rozmiar zdjęcia to 5MB.");
      return;
    }

    setLoading(true);
    try {
      const data = await addBouquet(name, price, image);
      setSuccess(data.message);
      setError(""); // Czyszczenie błędów
    } catch (error) {
      setError("Błąd podczas dodawania bukietu.");
      setSuccess(""); // Czyszczenie komunikatu sukcesu
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Dodaj Bukiet</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa bukietu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Cena"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input type="file" onChange={handleImageChange} required />
        {preview && (
          <div style={{ margin: " 5px 0px 5px 100px" }}>
            <img
              src={preview}
              alt="Podgląd bukietu"
              style={{ maxWidth: "200px", borderRadius: "8px" }}
            />{" "}
          </div>
        )}
        {error && (
          <div style={{ color: "red", textAlign: "center" }}>{error}</div>
        )}
        {success && (
          <div style={{ color: "green", textAlign: "center" }}>{success}</div>
        )}
        <button type="submit">
          {" "}
          {loading ? "Dodawanie..." : "Dodaj Bukiet"}
        </button>
      </form>
    </div>
  );
}

export default AddBouquet;
