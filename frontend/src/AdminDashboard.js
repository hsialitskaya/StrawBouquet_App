import React, { useEffect } from "react";
import adminImage from "./assets/admin.jpeg";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);
  return (
    <div>
      <h2>Witaj w Strefie Admina!</h2>
      <h3>Tu możesz zarządzać bukietami 💐</h3>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={adminImage}
          alt="adminImage"
          style={{
            height: "60vh",
            width: "auto",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            border: "5px solid #f48fb1",
          }}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
