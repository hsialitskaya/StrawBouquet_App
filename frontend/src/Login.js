import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import { useAuth } from "./AuthContext";

function Login() {
  const { keycloak, initialized } = useKeycloak();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAdmin, setAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized || !keycloak?.authenticated) return;

    const roles = keycloak.tokenParsed?.realm_access?.roles || [];
    const isAdmin = roles.includes("admin");

    setAuthenticated(true);
    setAdmin(isAdmin);

    setLoading(false);
    navigate(isAdmin ? "/admin-dashboard" : "/bouquets");
  }, [initialized, keycloak, navigate, setAdmin, setAuthenticated]);

  const handleLogin = () => {
    if (initialized) {
      setLoading(true);
      keycloak.login().catch(() => {
        setError("Błąd logowania. Spróbuj ponownie.");
        setLoading(false);
      });
    } else {
      setError("Keycloak nie został zainicjalizowany.");
    }
  };

  return (
    <div>
      <h2>Logowanie użytkownika</h2>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logowanie..." : "Zaloguj się przez Keycloak"}
      </button>
      {error && (
        <div style={{ color: "red", marginTop: "5px", textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default Login;
