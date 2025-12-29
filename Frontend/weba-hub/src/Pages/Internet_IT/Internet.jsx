import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Internet.css";
import axios from "axios";

const ITNetworkingPage = () => {
  const navigate = useNavigate();

  // ================== STATE ==================
  const [selectedService, setSelectedService] = useState(null);
  const [expandedServices, setExpandedServices] = useState({});
  const [servicesData, setServicesData] = useState({});
  const [techniciansData, setTechniciansData] = useState({
    exactMatches: [],
    relatedServices: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // NEW: Location and distance states
  const [userLocation, setUserLocation] = useState(null);
  const [distanceTier, setDistanceTier] = useState('5-10'); // Default distance
  const [locationLoading, setLocationLoading] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);

  // Distance tier options
  const distanceTiers = [
    { value: '1-5', label: '1-5 km', description: 'Very close to you' },
    { value: '5-10', label: '5-10 km', description: 'Close to your area' },
    { value: '10-50', label: '10-50 km', description: 'Within your city' },
    { value: '50-100', label: '50-100 km', description: 'Wider area search' },
    { value: '100+', label: '100+ km', description: 'Entire region' }
  ];

  // ================== LOCATION FUNCTIONS ==================
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setLocationLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationLoading(false);
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          setLocationLoading(false);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const handleLocationRetry = async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      if (selectedService) {
        // Refetch technicians with new location
        fetchTechnicians(selectedService, location);
      }
    } catch (error) {
      setError('Unable to get your location. Showing all technicians.');
    }
  };

  const handleDistanceTierChange = (newTier) => {
    setDistanceTier(newTier);
    setShowDistanceModal(false);
    
    if (selectedService) {
      // Refetch technicians with new distance
      fetchTechnicians(selectedService, userLocation);
    }
  };

  // ================== HELPERS ==================
  const handleViewProfile = (technicianId) => {
    navigate(`/techniciancategoryprofile/${technicianId}`);
  };

  // ================== FETCH SERVICES ==================
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/users/categories");
        const categories = response.data;

        const formattedData = {};
        
        categories.forEach((category) => {
          category.services.forEach((service) => {
            formattedData[service.name] = service.subServices || [];
          });
        });

        setServicesData(formattedData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);



  // ================== FETCH TECHNICIANS BY SERVICE ==================
  const fetchTechnicians = async (service, location = null) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        subService: service,
        category: "IT & Networking",
        distanceTier: distanceTier,
        page: 1,
        limit: 50
      };

      // Add location parameters if available
      if (location) {
        params.lat = location.lat;
        params.lng = location.lng;
      }

      // Use the new location-based API endpoint
      const response = await axios.get(
        `http://localhost:5000/api/techlocation/service`,
        { params }
      );

      const data = response.data;
      
      // Process the response for exact matches and related services
      const exactMatches = data.technicians || [];
      
      setTechniciansData({
        exactMatches: exactMatches,
        relatedServices: [] // You can modify this based on your needs
      });

     

    } catch (err) {
      console.error("Error fetching technicians:", err);
      setError("Failed to fetch technicians. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================== EVENT HANDLERS ==================
  const toggleServiceExpansion = (service) => {
    setExpandedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
  };

  const handleServiceSelect = async (service) => {
    setSelectedService(service);
    
    try {
      // Try to get user location first
      const location = await getUserLocation();
      setUserLocation(location);
      fetchTechnicians(service, location);
    } catch (error) {
      console.log("Location not available, showing all technicians");
      setUserLocation(null);
      fetchTechnicians(service);
    }
  };

  const handleBack = () => {
    setSelectedService(null);
    setTechniciansData({ exactMatches: [], relatedServices: [] });
    
  };

  const handleNavigateToCategory = () => {
    navigate("/categories");
  };

  // ================== RENDER LOCATION CONTROLS ==================
  const renderLocationControls = () => {
    return (
      <div className="location-controls">
        <div className="location-status">
          {locationLoading ? (
            <span className="location-loading">
              <i className="fas fa-spinner fa-spin"></i> Getting your location...
            </span>
          ) : userLocation ? (
            <span className="location-active">
              <i className="fas fa-map-marker-alt"></i> Searching near your location
            </span>
          ) : (
            <span className="location-inactive">
              <i className="fas fa-map-marker-alt"></i> Location unavailable - showing all technicians
            </span>
          )}
        </div>

        <div className="distance-controls">
          <button 
            className="distance-dropdown-btn"
            onClick={() => setShowDistanceModal(!showDistanceModal)}
          >
            <i className="fas fa-ruler"></i>
            {distanceTiers.find(t => t.value === distanceTier)?.label}
            <i className="fas fa-chevron-down"></i>
          </button>

          <button 
            className="location-retry-btn"
            onClick={handleLocationRetry}
            disabled={locationLoading}
          >
            <i className="fas fa-sync-alt"></i>
          </button>

          {showDistanceModal && (
            <div className="distance-modal">
              <div className="modal-header">
                <h3>Search Radius</h3>
                <button onClick={() => setShowDistanceModal(false)}>×</button>
              </div>
              <div className="distance-options">
                {distanceTiers.map(tier => (
                  <button
                    key={tier.value}
                    className={`distance-option ${distanceTier === tier.value ? 'active' : ''}`}
                    onClick={() => handleDistanceTierChange(tier.value)}
                  >
                    <div className="tier-info">
                      <span className="tier-label">{tier.label}</span>
                      <span className="tier-description">{tier.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ================== RENDER TECHNICIAN CARD ==================
  const renderTechnicianCard = (tech, type = "exact") => {
    const isPremium = tech.isPremiumActive;
    const distance = tech.displayDistance;

    return (
      <div key={tech._id} className={`technician-card ${type} ${isPremium ? 'premium' : ''}`}>
        {/* Premium Badge */}
        {isPremium && (
          <div className="premium-badge">
            <i className="fas fa-crown"></i> 
            {tech.visibilityTier === 'featured' ? 'Featured' : 'Premium'}
          </div>
        )}

        {/* Distance Badge */}
        {distance && (
          <div className={`distance-badge ${isPremium ? 'premium-distance' : ''}`}>
            <i className="fas fa-map-marker-alt"></i> 
            {distance.toFixed(1)} km away
            {isPremium && <span className="premium-globe"> 🌎</span>}
          </div>
        )}

        <div className="technician-image">
          <img
            src={tech.profilePicture || `https://i.pravatar.cc/100?u=${tech._id}`}
            alt={tech.username}
            onError={(e) => {
              e.target.src = `https://i.pravatar.cc/100?u=${tech._id}`;
            }}
          />
          {type === "exact" && (
            <div className="match-badge">Exact Match</div>
          )}
        </div>

        <div className="technician-info">
          <h3>{tech.username}</h3>
          <p className="specialty">{tech.profession || "IT & Networking Specialist"}</p>

          <div className="rating">
            <span className="stars">
              ⭐ {tech.rating?.average?.toFixed(1) || "No ratings"}
            </span>
            {tech.rating?.count > 0 && (
              <span className="reviews">
                ({tech.rating.count} reviews)
              </span>
            )}
          </div>

          {/* Services Offered */}
          <div className="services-offered">
            <p className="services-title">Services:</p>
            <div className="services-tags">
              {tech.subServices?.slice(0, 2).map((service, index) => (
                <span key={index} className="service-tag">
                  {service}
                </span>
              ))}
              {tech.subServices?.length > 2 && (
                <span className="service-tag more">
                  +{tech.subServices.length - 2} more
                </span>
              )}
            </div>
          </div>

          <div className="details">
            <p>
              <i className="fas fa-map-marker-alt"></i>{" "}
              {tech.address?.city || tech.address?.state || "Location not specified"}
            </p>
            {tech.projectRateCategory && (
              <p>
                <i className="fas fa-tag"></i>{" "}
                {tech.projectRateCategory === 'under_10000' && 'Under Ksh 10,000'}
                {tech.projectRateCategory === '10000_to_100000' && 'Ksh 10,000-100,000'}
                {tech.projectRateCategory === '100000_to_1000000' && 'Ksh 100,000-1M'}
                {tech.projectRateCategory === 'over_1000000' && 'Over Ksh 1M'}
              </p>
            )}
          </div>

          <div className="technician-actions">
            <button className="contact-btn">
              <i className="fas fa-envelope"></i> Contact
            </button>
            <button
              className="profile-btn"
              onClick={() => handleViewProfile(tech._id)}
            >
              <i className="fas fa-user"></i> View Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ================== RENDER TECHNICIANS LIST ==================
  const renderTechniciansList = () => {
    const { exactMatches, relatedServices } = techniciansData;

    return (
      <div className="technicians-section">
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back to Services
        </button>

        <div className="technicians-header">
          <div className="header-info">
            <h2>Technicians for {selectedService}</h2>
            <p className="technicians-count">
              {exactMatches.length} technicians available
              {userLocation && ` within ${distanceTiers.find(t => t.value === distanceTier)?.label}`}
            </p>
          </div>
          
          {renderLocationControls()}
        </div>

        {/* Premium Notice */}
        {exactMatches.some(tech => tech.isPremiumActive) && (
          <div className="premium-notice">
            <i className="fas fa-crown"></i>
            <span>Premium technicians appear first and are visible from any distance</span>
          </div>
        )}

        {/* Exact Matches */}
        {exactMatches.length > 0 ? (
          <div className="technicians-grid">
            {exactMatches.map((tech) => renderTechnicianCard(tech, "exact"))}
          </div>
        ) : (
          <div className="no-technicians">
            <i className="fas fa-user-slash"></i>
            <h3>No technicians available</h3>
            <p>
              {userLocation 
                ? `No technicians found for ${selectedService} within ${distanceTiers.find(t => t.value === distanceTier)?.label}. Try expanding your search radius.`
                : `No technicians specialize in ${selectedService} right now.`
              }
            </p>
            {userLocation && (
              <button 
                className="expand-search-btn"
                onClick={() => handleDistanceTierChange('100+')}
              >
                Expand search to entire region
              </button>
            )}
          </div>
        )}

        {/* Related Services Section - You can keep this if needed */}
        {relatedServices.length > 0 && (
          <div className="related-services">
            <div className="section-header">
              <h3>Related Service Technicians</h3>
              <p className="section-subtitle">
                {relatedServices.length} technicians offering similar services
              </p>
            </div>
            <div className="technicians-grid">
              {relatedServices.map((tech) => renderTechnicianCard(tech, "related"))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ================== RENDER ==================
  return (
    <div className="it-networking-page">
      {/* HEADER */}
      <header className="category-header">
        <div className="header-content">
          <button className="back-button" onClick={handleNavigateToCategory}>
            <i className="fas fa-arrow-left"></i> All Categories
          </button>
          <div className="category-icon">b
            <i className="fas fa-network-wired"></i>
          </div>
          <h1>IT & Networking</h1>
          <p className="category-description">
            Professional IT and networking services including internet setup,
            security systems, computer repairs, and more. Connect with skilled
            technicians in your area.
          </p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {loading && (
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> {locationLoading ? 'Getting your location...' : 'Loading technicians...'}
          </div>
        )}
        {error && <div className="error">{error}</div>}

        {!selectedService ? (
          <div className="services-section">
            <h2>Our IT & Networking Services</h2>
            <p>Select a service category to view available technicians near you</p>

            <div className="services-grid">
              {Object.entries(servicesData).map(([service, subservices]) => (
                <div key={service} className="service-card">
                  {/* Service Header */}
                  <div
                    className="service-header"
                    onClick={() =>
                      subservices.length > 0 && toggleServiceExpansion(service)
                    }
                    style={{
                      cursor: subservices.length > 0 ? "pointer" : "default",
                    }}
                  >
                    <div className="service-icon">
                      {service === "Internet Services" && (
                        <i className="fas fa-wifi"></i>
                      )}
                      {service === "CCTV" && <i className="fas fa-video"></i>}
                      {service === "Computer Services" && (
                        <i className="fas fa-laptop"></i>
                      )}
                      {service === "Alarm System Installation" && (
                        <i className="fas fa-shield-alt"></i>
                      )}
                      {service === "POS Installation & Support" && (
                        <i className="fas fa-cash-register"></i>
                      )}
                      {service === "Phone Repair" && (
                        <i className="fas fa-mobile-alt"></i>
                      )}
                      {service === "TV Repair" && (
                        <i className="fas fa-tv"></i>
                      )}
                    </div>

                    <h3>{service}</h3>

                    {subservices.length > 0 && (
                      <button
                        className={`expand-btn ${
                          expandedServices[service] ? "expanded" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleServiceExpansion(service);
                        }}
                      >
                        <i className="fas fa-chevron-down"></i>
                      </button>
                    )}
                  </div>

                  {/* Subservices */}
                  {expandedServices[service] && subservices.length > 0 && (
                    <div className="subservices-list">
                      {subservices.map((sub) => (
                        <div
                          key={sub}
                          className="subservice-item"
                          onClick={() => handleServiceSelect(sub)}
                        >
                          <i className="fas fa-cog"></i>
                          <span>{sub}</span>
                          <i className="fas fa-arrow-right"></i>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Subservices */}
                  {subservices.length === 0 && (
                    <button
                      className="select-service-btn"
                      onClick={() => handleServiceSelect(service)}
                    >
                      Select Service <i className="fas fa-arrow-right"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          renderTechniciansList()
        )}
      </div>
    </div>
  );
};

export default ITNetworkingPage;