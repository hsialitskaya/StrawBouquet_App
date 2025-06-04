import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else if (adminOnly && !isAdmin) {
      // Dodajemy opcjonalny stan do przekazania informacji
      navigate("/", { 
        replace: true,
        state: { permissionError: "Brak uprawnień administratora" }
      });
    }
  }, [isAuthenticated, isAdmin, adminOnly, navigate]);

  if (isAuthenticated && (!adminOnly || isAdmin)) {
    return children;
  }

  // Tymczasowy komunikat ładowania
  return <div>Sprawdzanie uprawnień...</div>;
};

export default ProtectedRoute;