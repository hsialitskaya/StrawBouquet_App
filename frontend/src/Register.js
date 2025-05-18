import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { registerUser } from "./api";
import { useAuth } from "./AuthContext";

function Register() {
  const { keycloak, initialized } = useKeycloak();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUserData = async () => {
      if (initialized && keycloak?.authenticated) {
        setLoading(true);
        try {
          const userData = keycloak.tokenParsed;
          const response = await registerUser(userData);

          if (response?.success) {
            setAuthenticated(true);
            navigate("/bouquets");
          } else {
            setError("Wystąpił problem podczas rejestracji. Spróbuj ponownie.");
          }
        } catch (error) {
          setError("Błąd serwera. Spróbuj ponownie później.");
        } finally {
          setLoading(false);
        }
      }
    };

    handleUserData();
  }, [initialized, keycloak, setAuthenticated, navigate]);

  const handleRegister = () => {
    if (initialized) {
      keycloak.register().catch(() => {
        setError("Błąd rejestracji. Spróbuj ponownie.");
      });
    } else {
      setError("Keycloak nie został zainicjalizowany.");
    }
  };

  return (
    <div>
      <h2>Rejestracja użytkownika</h2>
      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Rejestracja..." : "Zarejestruj się przez Keycloak"}
      </button>
      {error && (
        <div style={{ color: "red", marginTop: "5px", textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default Register;
