import React, { useState, useEffect } from "react";
import "../styles/Properties.css";
import { Tabs, Tab } from "react-bootstrap"; // Import Tabs and Tab components from React Bootstrap


const Properties = () => {
  // State for all properties
  const [properties, setProperties] = useState([]);
  // State for filtered properties based on search or filters
  const [filteredProperties, setFilteredProperties] = useState([]);
  // State for the search term input
  const [searchTerm, setSearchTerm] = useState("");
  // State for favorite properties
  const [favorites, setFavorites] = useState([]);
   // State for currently selected property for details view
  const [selectedProperty, setSelectedProperty] = useState(null);
  // State to toggle the advanced search modal
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  // State to hold advanced search filters
  const [filters, setFilters] = useState({
    type: "any",
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
    maxBedrooms: "",
    startDate: "",
    endDate: "",
    postcode: "",
  });

  // State to manage the active tab in property details
  const [activeTab, setActiveTab] = useState("description");

  // Save favorites to local storage
  const saveFavoritesToLocalStorage = (favorites) => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  // Load favorites from local storage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

   // Fetch properties data on component mount
  useEffect(() => {
    fetch("/properties.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProperties(data.properties); // Set all properties
        setFilteredProperties(data.properties);  // Initialize filtered properties
      })
      .catch((error) => {
        console.error("Error loading properties:", error);
        alert("Failed to load properties. Please check the console for details.");
      });
  }, []);

  // Handle tab selection for the property details modal
  const handleTabSelect = (tabKey) => setActiveTab(tabKey);

  // Filter properties based on the search term
  const handleSearch = () => {
    const filtered = properties.filter((property) =>
      property.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProperties(filtered);
  };

  // Apply filters in the advanced search modal
  const handleAdvancedSearch = () => {
    const {
      type,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      startDate,
      endDate,
      postcode,
    } = filters;

    // Filter properties based on advanced search criteria
    const filtered = properties.filter((property) => {
      const meetsType =
        type === "any" || property.type.toLowerCase() === type.toLowerCase();
      const meetsPrice =
        (!minPrice || property.price >= parseInt(minPrice)) &&
        (!maxPrice || property.price <= parseInt(maxPrice));
      const meetsBedrooms =
        (!minBedrooms || property.bedrooms >= parseInt(minBedrooms)) &&
        (!maxBedrooms || property.bedrooms <= parseInt(maxBedrooms));
      const meetsDate =
        (!startDate ||
          new Date(
            `${property.added.year}-${property.added.month}-${property.added.day}`
          ) >= new Date(startDate)) &&
        (!endDate ||
          new Date(
            `${property.added.year}-${property.added.month}-${property.added.day}`
          ) <= new Date(endDate));
      const meetsPostcode =
        !postcode || property.location.toLowerCase().includes(postcode.toLowerCase());

      return meetsType && meetsPrice && meetsBedrooms && meetsDate && meetsPostcode;
    });

    setFilteredProperties(filtered);
    setIsAdvancedSearchOpen(false);
  };

  // Add property to favorites
  const addToFavorites = (property) => {
    if (!favorites.some((fav) => fav.id === property.id)) {
    const updatedFavorites = [...favorites, property];
    setFavorites(updatedFavorites);
    saveFavoritesToLocalStorage(updatedFavorites);
    }
  };

  // Remove property from favorites
  const removeFromFavorites = (id) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== id);
    setFavorites(updatedFavorites);
    saveFavoritesToLocalStorage(updatedFavorites);
  };

  // Clear all favorites and remove them from local storage
  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem("favorites");
  };

  
  // Open property details modal
  const openDetails = (property) => setSelectedProperty(property);

  // Close property details modal
  const closeDetails = () => setSelectedProperty(null);

  // Handle drag start for adding to favorites
  const handleDragStart = (event, property) => {
    event.dataTransfer.setData("property", JSON.stringify(property));
  };
  
  // Handle drop event to add a property to favorites
  const handleDropToFavorites = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("property");
    if (!data) return;
    try {
      const property = JSON.parse(data);
      if (property) {
        addToFavorites(property);
      }
    } catch (error) {
      console.error("Failed to parse dragged property data:", error);
    }
  };
  
  // Handle drop event to remove a property from favorites
  const handleDropToRemove = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("property");
    if (!data) return;
    try {
      const property = JSON.parse(data);
      if (property) {
        removeFromFavorites(property.id);
      }
    } catch (error) {
      console.error("Failed to parse dragged property data:", error);
    }
  };

    // Prevent default behavior for drag over
  const handleDragOver = (event) => event.preventDefault();

  return (
    <div className="properties-container">

      {/* Search Bar for Simple and Advanced Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by type (e.g., House, Flat)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => setIsAdvancedSearchOpen(true)}>Advanced Search</button>
      </div>

      {/* Advanced Search Modal */}
      {isAdvancedSearchOpen && (
        <div className="search-modal">
          <div className="search-modal-content">
            <h2>Advanced Search</h2>
            <label>
              Type:
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="any">Any</option>
                <option value="house">House</option>
                <option value="flat">Flat</option>
              </select>
            </label>
            <label>
              Min Price:
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </label>
            <label>
              Max Price:
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </label>
            <label>
              Min Bedrooms:
              <input
                type="number"
                value={filters.minBedrooms}
                onChange={(e) =>
                  setFilters({ ...filters, minBedrooms: e.target.value })
                }
              />
            </label>
            <label>
              Max Bedrooms:
              <input
                type="number"
                value={filters.maxBedrooms}
                onChange={(e) =>
                  setFilters({ ...filters, maxBedrooms: e.target.value })
                }
              />
            </label>
            <label>
              Start Date:
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </label>
            <label>
              Postcode:
              <input
                type="text"
                value={filters.postcode}
                onChange={(e) => setFilters({ ...filters, postcode: e.target.value })}
              />
            </label>
            <button onClick={handleAdvancedSearch}>Apply Filters</button>
            <button onClick={() => setIsAdvancedSearchOpen(false)}>Close</button>
          </div>
        </div>
      )}

      <h1 className="page-title">Available Properties</h1>
      
      <div className="properties-grid">
      {filteredProperties.length === 0 ? (
        <p className="no-properties-message">
          No properties match your search criteria. Please try again with different filters.
        </p>
      ) : (

         // Map through filtered properties and display each as a card
        filteredProperties.map((property) => (
          <div
            key={property.id} 
            className="property-card"
            draggable
            onDragStart={(event) => handleDragStart(event, property)}
          >
            <img
              src={property.picture || "default-placeholder.jpg"}
              alt={property.type}
              className="property-image"
            />
            <div className="property-details">
              <h3>{property.type}</h3>
              <p>{property.bedrooms} Bedrooms</p>
              <p>£{property.price.toLocaleString()}</p>
              <p>{property.location}</p>
              <button
                className="details-button"
                onClick={() => openDetails(property)}
              >
                View Details
              </button>
              <button
                className="favorite-button"
                onClick={() => addToFavorites(property)}
                disabled={favorites.some((fav) => fav.id === property.id)}
              >
                {favorites.some((fav) => fav.id === property.id)
                  ? "Added to Favorites"
                  : "Add to Favorites"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>


      <div className="favorites-section"
       onDrop={handleDropToFavorites}
       onDragOver={handleDragOver}
       >
        
        <div className="favorites-header">
          <h2>Favorites</h2>
          <button className="clear-button" onClick={clearFavorites}>
            Clear All
          </button>
        </div>
        {favorites.length === 0 ? (
          <p>No favorites added yet!</p>
        ) : (
          <div className="favorites-grid">
            <div
              className="remove-area"  // Section to drag properties out for removal
              onDrop={handleDropToRemove}// Handle drop event to remove from favorites
              onDragOver={handleDragOver}
             
            >
              Drag here to remove from favorites
            </div>
            {favorites.map((fav) => (
              <div key={fav.id} className="favorite-card"
              draggable
              onDragStart={(event) => handleDragStart(event, fav)}
              >

                <img src={fav.picture || "default-placeholder.jpg"} alt={fav.type} className="favorite-image" />

                <div className="favorite-details">
                  <h3>{fav.type}</h3>
                  <p>{fav.bedrooms} Bedrooms</p>
                  <p>£{fav.price.toLocaleString()}</p>
                  <p>{fav.location}</p>
                  <button
                    className="remove-button"
                    onClick={() => removeFromFavorites(fav.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
          </div>
        )}
        
      </div>


{/* Property Details Modal */}
      {selectedProperty && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal" onClick={closeDetails}>
              &times;
            </button>
            <h2>
              {selectedProperty.type} - £{selectedProperty.price.toLocaleString()}
            </h2>
            <div className="property-view">
              <div className="main-image">
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <img
                    src={selectedProperty.images[0]}
                    alt="Main View"
                    className="large-image"
                  />
                ) : (
                  <p>No image available</p>
                )}
              </div>
              <div className="thumbnails">
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  selectedProperty.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="thumbnail"
                    />
                  ))
                ) : (
                  <p>No thumbnails available</p>
                )}
              </div>
            </div>
            <Tabs
              activeKey={activeTab}
              onSelect={handleTabSelect}
              className="property-tabs"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginBottom: '20px',
                marginTop:'80px',
              }}
            >
              <Tab eventKey="description" title={
                  <span style={{ color: "#007bff",fontWeight: "bold", padding: "10px 20px" }}>
                    Description
                  </span>
                }
              >
                {activeTab === "description" && (
                  <p>{selectedProperty.description}</p>
                )}
              </Tab>
              <Tab eventKey="floorPlan" title={
                <span style={{ color: "#007bff", fontWeight: "bold", padding: "10px 20px" }}>
                  Floor Plan
                </span>
              }
            >
                {activeTab === "floorPlan" && (
                  <img
                    src={selectedProperty.floorPlan}
                    alt="Floor Plan"
                    className="floor-plan"
                    style={{
                      maxHeight: "600px",
                      maxWidth: "700px",
                    }}
                  />
                )}
              </Tab>
              <Tab eventKey="map" title={
                  <span style={{ color: "#007bff", fontWeight: "bold", padding: "10px 20px" }}>
                    Google Map
                  </span>
                }
              >
                {activeTab === "map" && selectedProperty.location && (
                  <iframe
                  title="Google Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    selectedProperty.location
                  )}&output=embed`}
                  width="600"
                  height="450"
                  style={{ border: "0" }}
                  allowFullScreen=""
                  loading="lazy"
                />

                )}
              </Tab>

            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
