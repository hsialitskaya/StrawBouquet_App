import axios from "axios";
import keycloak from "./keycloak";


// Instancja dla serwisu produktów
const productApi = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
});

// Instancja dla serwisu koszyka
const cartApi = axios.create({
  baseURL: "http://localhost:5002",
  withCredentials: true,
});

// Interceptor do obu instancji
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(async (config) => {
    if (keycloak.token) {
      try {
        await keycloak.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error("Failed to refresh token:", error);
        keycloak.logout();
      }
    }
    return config;
  });
};



addAuthInterceptor(productApi);
addAuthInterceptor(cartApi);

axios.interceptors.request.use(async (config) => {
  if (keycloak.token) {
    try {
      await keycloak.updateToken(30);
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      keycloak.logout();
    }
  }
  return config;
});

export const registerUser = async (userData) => {
  try {
    const response = await cartApi.post("/register", {
      email: userData.email,
      nickname: userData.preferred_username,
    });
    return response.data;
  } catch (error) {
    const errorMessage = "Błąd serwera. Spróbuj ponownie później.";
    throw new Error(errorMessage);
  }
};

export const fetchBouquets = async () => {
  try {
    const response = await productApi.get("/bouquets");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Błąd sieciowy. Spróbuj ponownie później.";
    console.error("Błąd pobierania bukietów:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const addBouquet = async (name, price, image) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("image", image);

  try {
    const response = await productApi.post("/add_bouquet", formData);
    return response.data;
  } catch (error) {
    console.error("Błąd podczas dodawania bukietu do bazy:", error);
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error("Niepoprawne dane bukietu. Sprawdź formularz.");
      }
    } else {
      throw new Error("Błąd sieciowy. Spróbuj ponownie później.");
    }
  }
};

export const deleteBouquet = async (bouquetId) => {
  try {
    const response = await productApi.delete(`/bouquet/${bouquetId}`);
    return response.data;
  } catch (error) {
    console.error("Błąd usuwania bukietu z bazy:", error);

    // Obsługa różnych błędów na podstawie kodu odpowiedzi HTTP
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error("Bukiet o podanym ID nie został znaleziony.");
      } else if (error.response.status === 401) {
        throw new Error("Brak autoryzacji. Zaloguj się ponownie.");
      } else if (error.response.status === 500) {
        throw new Error(
          "Wystąpił problem z serwerem. Spróbuj ponownie później."
        );
      } else {
        throw new Error("Wystąpił błąd. Spróbuj ponownie później.");
      }
    } else if (error.request) {
      // Błąd związany z brakiem odpowiedzi (np. brak połączenia z serwerem)
      throw new Error(
        "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
      );
    } else {
      // Ogólny błąd
      throw new Error("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
    }
  }
};

export const addToCart = async (bouquetId) => {
  try {
    const response = await cartApi.post(
      "/cart",
      { bouquet_id: bouquetId });
    return response.data;
  } catch (error) {
    console.error("Błąd dodawania do koszyka:", error);

    if (error.response) {
      const message =
        error.response.status === 400
          ? "Nieprawidłowe dane. Sprawdź wybrany bukiet."
          : error.response.status === 401
          ? "Brak autoryzacji. Zaloguj się ponownie."
          : error.response.status === 404
          ? "Bukiet nie został znaleziony."
          : error.response.status === 500
          ? "Wystąpił problem z serwerem. Spróbuj ponownie później."
          : "Wystąpił błąd podczas dodawania do koszyka. Spróbuj ponownie.";

      throw new Error(message);
    }

    throw new Error(
      "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
    );
  }
};

export const fetchCart = async () => {
  try {
    const response = await cartApi.get("/cart");
    return response.data;
  } catch (error) {
    console.error("Błąd pobierania koszyka:", error);

    if (error.response) {
      const message =
        error.response.status === 404
          ? "Koszyk nie został znaleziony."
          : error.response.status === 401
          ? "Brak autoryzacji. Zaloguj się ponownie."
          : error.response.status === 500
          ? "Wystąpił problem z serwerem. Spróbuj ponownie później."
          : "Wystąpił błąd podczas pobierania koszyka. Spróbuj ponownie.";

      throw new Error(message);
    }

    throw new Error(
      "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
    );
  }
};

export const updateQuantity = async (cartItemId, newQuantity) => {
  if (newQuantity < 1) return;

  try {
    await cartApi.put(
      `/cart/${cartItemId}`,
      { quantity: newQuantity });
  } catch (error) {
    console.error("Błąd aktualizacji ilości:", error);

    if (error.response) {
      const message =
        error.response.status === 400
          ? "Nieprawidłowa ilość. Ilość musi być większa lub równa 1."
          : error.response.status === 401
          ? "Brak autoryzacji. Zaloguj się ponownie."
          : error.response.status === 404
          ? "Pozycja w koszyku nie została znaleziona."
          : error.response.status === 500
          ? "Wystąpił problem z serwerem. Spróbuj ponownie później."
          : "Wystąpił błąd podczas aktualizacji ilości. Spróbuj ponownie.";

      throw new Error(message);
    }

    throw new Error(
      "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
    );
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    await cartApi.delete(`/cart/${cartItemId}`);
  } catch (error) {
    console.error("Błąd usuwania z koszyka:", error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error("Pozycja w koszyku nie została znaleziona.");
      } else if (error.response.status === 401) {
        throw new Error("Brak autoryzacji. Zaloguj się ponownie.");
      } else if (error.response.status === 500) {
        throw new Error(
          "Wystąpił problem z serwerem. Spróbuj ponownie później."
        );
      } else {
        throw new Error(
          "Wystąpił błąd podczas usuwania z koszyka. Spróbuj ponownie."
        );
      }
    } else if (error.request) {
      throw new Error(
        "Brak połączenia z serwerem. Sprawdź swoje połączenie internetowe."
      );
    } else {
      throw new Error("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
    }
  }
};
