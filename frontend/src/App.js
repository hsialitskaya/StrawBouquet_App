import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Home from "./Home";
import Register from "./Register";
import Login from "./Login";
import Logout from "./Logout";
import AdminDashboard from "./AdminDashboard";
import BouquetList from "./BouquetList";
import AddBouquet from "./AddBouquet";
import DeleteBouquet from "./DeleteBouquet";
import Cart from "./Cart";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Router>
      <nav>
        {isAuthenticated ? (
          isAdmin ? (
            <>
              <Link to="/admin-dashboard" style={{ color: "white" }}>
                Strona główna
              </Link>
              <span style={{ color: "white", margin: "0 8px" }}>|</span>
              <Link to="/add-bouquet" style={{ color: "white" }}>
                Dodaj Bukiet
              </Link>
              <span style={{ color: "white", margin: "0 8px" }}>|</span>
              <Link to="/delete-bouquet" style={{ color: "white" }}>
                Usuń Bukiet
              </Link>
              <span style={{ color: "white", margin: "0 8px" }}>|</span>
              <Link to="/logout" style={{ color: "white" }}>
                Wyloguj się
              </Link>
            </>
          ) : (
            <>
              <Link to="/bouquets" style={{ color: "white" }}>
                Zrób zamówienie
              </Link>
              <span style={{ color: "white", margin: "0 8px" }}>|</span>
              <Link to="/cart" style={{ color: "white" }}>
                Koszyk
              </Link>
              <span style={{ color: "white", margin: "0 8px" }}>|</span>
              <Link to="/logout" style={{ color: "white" }}>
                Wyloguj się
              </Link>
            </>
          )
        ) : (
          <>
            <Link to="/" style={{ color: "white" }}>
              Strona główna
            </Link>
            <span style={{ color: "white", margin: "0 8px" }}>|</span>
            <Link to="/register" style={{ color: "white" }}>
              Rejestracja
            </Link>
            <span style={{ color: "white", margin: "0 8px" }}>|</span>
            <Link to="/login" style={{ color: "white" }}>
              Logowanie
            </Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/bouquets" element={<BouquetList />} />
        <Route path="/add-bouquet" element={<AddBouquet />} />
        <Route path="/delete-bouquet" element={<DeleteBouquet />} />
        <Route path="/cart" element={<Cart />} /> */}

        {/* Chronione ścieżki */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bouquets"
          element={
            <ProtectedRoute>
              <BouquetList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-bouquet"
          element={
            <ProtectedRoute adminOnly>
              <AddBouquet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delete-bouquet"
          element={
            <ProtectedRoute adminOnly>
              <DeleteBouquet />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
