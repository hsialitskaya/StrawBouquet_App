import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useKeycloak } from "@react-keycloak/web";

const Logout = () => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const { setAdmin, setAuthenticated } = useAuth();

  useEffect(() => {
    const logoutUser = async () => {
      try {
        await keycloak.logout();
        setAdmin(false);
        setAuthenticated(false);
        navigate("/");
      } catch (error) {
        console.error("Nie udało się wylogować:", error);
      }
    };

    logoutUser();
  }, [keycloak, setAdmin, setAuthenticated, navigate]);

  return <p>Wylogowywanie...</p>;
};

export default Logout;
