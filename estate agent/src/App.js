import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Properties from "./pages/Properties";

import "./styles/App.css";

const App = () => {
  const [favorites, setFavorites] = useState([]); // State to handle favorite properties

  // Add property to favorites
  const addToFavorites = (property) => {
    if (!favorites.some((fav) => fav.id === property.id)) {
      setFavorites([...favorites, property]);
    }
  };

  // Remove property from favorites
  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter((property) => property.id !== id));
  };

  // Clear all favorites
  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <Router>
      <div className="main-wrapper">
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                <Hero />
                <Properties
                  addToFavorites={addToFavorites}
                  favorites={favorites}
                  removeFromFavorites={removeFromFavorites}
                  clearFavorites={clearFavorites}
                />
                </>
              }
            />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
