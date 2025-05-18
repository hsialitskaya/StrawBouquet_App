import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setAdmin] = useState(false);

  // Funkcja do ustawiania roli
  const updateIsAuthenticated = (bool) => {
    setIsAuthenticated(bool);
  };

  // Funkcja do ustawiania roli
  const updateAdminStatus = (bool) => {
    setAdmin(bool);
  };

  return (
    <AuthContext.Provider
      value={{
        setAuthenticated: updateIsAuthenticated,
        setAdmin: updateAdminStatus,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
