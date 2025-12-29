// Import React and hooks for state & side effects
import React, { useState, useEffect } from "react";
// Import useNavigate for routing/navigation
import { useNavigate } from "react-router-dom";
import './RelatedCategories.css'

// Define the RelatedCategories component
const RelatedCategories = () => {
  // State to store list of services fetched from backend
  const [services, setServices] = useState([]);
  // State to store technicians for the selected service
  const [techniciansData, setTechniciansData] = useState({});
  // State to track which service is currently selected
  const [selectedService, setSelectedService] = useState(null);
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Hook for navigation (e.g., go to profile page)
  const navigate = useNavigate();

  // ================= FETCH SERVICES ON COMPONENT LOAD =================
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");
        // Use the categories endpoint that exists
        const res = await fetch("http://localhost:5000/api/users/categories");
        
        if (!res.ok) {
          throw new Error(`Failed to fetch services: ${res.status}`);
        }
        
        const categories = await res.json();
        
        // Extract all services from all categories
        const allServices = [];
        categories.forEach(category => {
          if (category.services && category.services.length > 0) {
            category.services.forEach(service => {
              allServices.push({
                ...service,
                category: category.name,
                _id: service._id || `${category.name}-${service.name}` // Generate ID if not present
              });
            });
          }
        });
        
        setServices(allServices);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  // ================= FETCH TECHNICIANS FOR SELECTED SERVICE =================
  const handleServiceClick = async (serviceName, category) => {
    try {
      setLoading(true);
      setError("");
      
      // Use the correct endpoint for fetching technicians by service
      const res = await fetch(
        `http://localhost:5000/api/technicians/technicians_subservice?subService=${encodeURIComponent(serviceName)}&category=${encodeURIComponent(category)}`
      );
      
      if (!res.ok) {
        throw new Error(`Failed to fetch technicians: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Save technicians into state
      setTechniciansData({
        exactMatches: data.exactMatches || [],
        relatedServices: data.relatedServices || []
      });
      setSelectedService(serviceName);
    } catch (err) {
      console.error("Error fetching technicians:", err);
      setError("Failed to load technicians. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= GO BACK TO SERVICES LIST =================
  const handleBack = () => {
    setSelectedService(null);
    setTechniciansData({});
    setError("");
  };

  // ================= NAVIGATE TO PROFILE PAGE =================
  const handleViewProfile = (id) => {
    navigate(`/technician/${id}`);
  };

  // ================= RENDER LOADING STATE =================
  const renderLoading = () => (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );

  // ================= RENDER ERROR STATE =================
  const renderError = () => (
    <div className="error-state">
      <i className="fas fa-exclamation-triangle"></i>
      <h3>Something went wrong</h3>
      <p>{error}</p>
      <button className="retry-btn" onClick={handleBack}>
        Try Again
      </button>
    </div>
  );

  // ================= RENDER SERVICES GRID =================
  const renderServicesGrid = () => (
    <div className="services-section">
      <h2>Available Services</h2>
      <p className="services-count">{services.length} services available</p>
      
      {services.length > 0 ? (
        <div className="services-grid">
          {services.map((service) => (
            <div
              key={service._id}
              className="service-card"
              onClick={() => handleServiceClick(service.name, service.category)}
            >
              <div className="service-icon">
                <i className={`fas ${getServiceIcon(service.name)}`}></i>
              </div>
              <div className="service-info">
                <h4>{service.name}</h4>
                <span className="category-badge">{service.category}</span>
                <p className="subservices-count">
                  {service.subServices?.length || 0} specialties
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-services">
          <i className="fas fa-concierge-bell"></i>
          <h3>No Services Available</h3>
          <p>Check back later for available services.</p>
        </div>
      )}
    </div>
  );

  // ================= RENDER TECHNICIANS LIST =================
  const renderTechniciansList = () => {
    const { exactMatches = [], relatedServices = [] } = techniciansData;

    return (
      <div className="technicians-section">
        {/* Back button to go back to services list */}
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back to Services
        </button>

        {/* Main Service Technicians */}
        <h2>Technicians for {selectedService}</h2>
        <p className="technicians-count">
          {exactMatches.length} specialized technicians available
        </p>

        {exactMatches.length > 0 ? (
          <div className="technicians-grid">
            {exactMatches.map((technician) => (
              <div key={technician._id} className="technician-card">
                <div className="technician-image">
                  <img
                    src={technician.profilePicture || "/default-profile.png"}
                    alt={technician.username}
                    onError={(e) => {
                      e.target.src = "/default-profile.png";
                    }}
                  />
                </div>
                <div className="technician-info">
                  <h4>{technician.username}</h4>
                  <p className="profession">{technician.profession || "Service Provider"}</p>
                  <div className="rating">
                    <i className="fas fa-star"></i>
                    <span>{technician.rating?.average?.toFixed(1) || "New"}</span>
                    <span className="review-count">
                      ({technician.rating?.count || 0} reviews)
                    </span>
                  </div>
                  <p className="about">{technician.about?.slice(0, 80)}...</p>
                  <button
                    className="profile-btn"
                    onClick={() => handleViewProfile(technician._id)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-technicians">
            <i className="fas fa-user-slash"></i>
            <h3>No Specialized Technicians</h3>
            <p>No technicians specialize in {selectedService} right now.</p>
          </div>
        )}

        {/* Related Services Technicians */}
        {relatedServices.length > 0 && (
          <div className="related-services">
            <h3>Other Technicians in This Category</h3>
            <p className="related-count">
              {relatedServices.length} related technicians available
            </p>
            <div className="technicians-grid">
              {relatedServices.map((technician) => (
                <div key={technician._id} className="technician-card related">
                  <div className="technician-image">
                    <img
                      src={technician.profilePicture || "/default-profile.png"}
                      alt={technician.username}
                      onError={(e) => {
                        e.target.src = "/default-profile.png";
                      }}
                    />
                  </div>
                  <div className="technician-info">
                    <h4>{technician.username}</h4>
                    <p className="profession">{technician.profession || "Service Provider"}</p>
                    <div className="rating">
                      <i className="fas fa-star"></i>
                      <span>{technician.rating?.average?.toFixed(1) || "New"}</span>
                    </div>
                    <p className="services">
                      Services: {technician.services?.slice(0, 2).join(", ")}
                      {technician.services?.length > 2 && "..."}
                    </p>
                    <button
                      className="profile-btn"
                      onClick={() => handleViewProfile(technician._id)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ================= HELPER FUNCTION FOR SERVICE ICONS =================
  const getServiceIcon = (serviceName) => {
    const iconMap = {
      // IT & Networking Icons
      "Internet Services": "fa-wifi",
      "CCTV": "fa-video",
      "Computer Services": "fa-laptop",
      "Alarm System Installation": "fa-shield-alt",
      "POS Installation & Support": "fa-cash-register",
      "Phone Repair": "fa-mobile-alt",
      "TV Repair": "fa-tv",
      
      // Electrical Services Icons
      "Residential Electrical": "fa-home",
      "Commercial Electrical": "fa-building",
      
      // Programming Icons
      "Web Development": "fa-code",
      "Mobile App Development": "fa-mobile",
      "Software Services": "fa-cogs",
      
      // Default icon
      "default": "fa-concierge-bell"
    };
    
    return iconMap[serviceName] || iconMap.default;
  };

  // ================= MAIN RETURN =================
  return (
    <div className="services-page">
      {error && renderError()}
      
      {loading ? (
        renderLoading()
      ) : !selectedService ? (
        renderServicesGrid()
      ) : (
        renderTechniciansList()
      )}
    </div>
  );
};

// Export component so it can be imported in routes
export default RelatedCategories;