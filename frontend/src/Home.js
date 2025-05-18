import React from "react";
import homeImage from "./assets/home.png";

function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          marginBottom: "5px",
        }}
      >
        Witaj w StrawBouquet
      </h1>

      <h3
        style={{
          width: "900px",
        }}
      >
        Firma StrawBouquet specjalizuje się w tworzeniu wyjątkowych bukietów z
        truskawek 🍓, które zachwycają nie tylko smakiem, ale i estetyką. Każdy
        bukiet to połączenie świeżości, kreatywności i pasji do natury.
      </h3>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={homeImage}
          alt="homeImage"
          loading="lazy"
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

export default Home;
