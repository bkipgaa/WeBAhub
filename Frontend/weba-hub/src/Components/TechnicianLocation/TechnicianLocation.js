import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './TechnicianLocation.css';

const TechnicianLocation = () => {
  const { category, subService } = useParams();
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceTier, setDistanceTier] = useState('5-10');
  const [technicianCounts, setTechnicianCounts] = useState({});
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [responseData, setResponseData] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const distanceTiers = [
    { value: '1-5', label: '1-5 km', icon: 'fas fa-map-marker-alt' },
    { value: '5-10', label: '5-10 km', icon: 'fas fa-street-view' },
    { value: '10-50', label: '10-50 km', icon: 'fas fa-city' },
    { value: '50-100', label: '50-100 km', icon: 'fas fa-globe-africa' },
    { value: '100+', label: '100+ km', icon: 'fas fa-globe' }
  ];

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      const defaultLocation = { lat: -3.2168, lng: 40.1200 };
      setUserLocation(defaultLocation);
      fetchTechnicianCounts(defaultLocation.lat, defaultLocation.lng);
      fetchTechnicians(defaultLocation.lat, defaultLocation.lng);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchTechnicianCounts(latitude, longitude);
        fetchTechnicians(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to retrieve your location. Using default location.');
        const defaultLocation = { lat: -3.2168, lng: 40.1200 };
        setUserLocation(defaultLocation);
        fetchTechnicianCounts(defaultLocation.lat, defaultLocation.lng);
        fetchTechnicians(defaultLocation.lat, defaultLocation.lng);
      }
    );
  }, [category, subService]);

  const fetchTechnicianCounts = async (lat, lng) => {
    try {
      if (!subService || !category) return;

      const params = {
        subService: subService,
        category: category,
        lat,
        lng
      };

      const response = await axios.get('http://localhost:5000/api/techlocation/counts', { params });
      setTechnicianCounts(response.data.counts);
    } catch (err) {
      console.error('Error fetching technician counts:', err);
    }
  };

  const fetchTechnicians = async (lat = null, lng = null) => {
    try {
      setLoading(true);
      
      if (!subService || !category) {
        setError('Service and category are required');
        setLoading(false);
        return;
      }

      const params = {
        subService: subService,
        category: category,
        distanceTier,
        page: 1,
        limit: 50
      };

      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }

      const response = await axios.get('http://localhost:5000/api/techlocation/service', { params });
      setTechnicians(response.data.technicians);
      setResponseData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching technicians:', err);
      setError('Failed to fetch technicians. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDistanceTierChange = (newTier) => {
    setDistanceTier(newTier);
    setShowDistanceModal(false);
    if (userLocation) {
      fetchTechnicians(userLocation.lat, userLocation.lng);
    } else {
      fetchTechnicians();
    }
  };

  const handleViewProfile = (technicianId) => {
    navigate(`/technician/${technicianId}`);
  };

  const handleContact = (technicianId) => {
    navigate(`/chat/${technicianId}`);
  };

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  if (!category || !subService) {
    return (
      <div className="tech-location-page">
        <div className="error-container">
          <div className="error-content">
            <i className="fas fa-exclamation-circle"></i>
            <h2>Missing Information</h2>
            <p>Category or service parameter is missing.</p>
            <button 
              onClick={() => navigate('/category')}
              className="primary-btn"
            >
              <i className="fas fa-arrow-left"></i>
              Browse Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tech-location-page">
      {/* Floating Header */}
      <div className={`floating-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <button 
            onClick={() => navigate(-1)}
            className="header-back-btn"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          
          <div className="header-info">
            <h1>{subService}</h1>
            <div className="category-chip">
              <i className="fas fa-tag"></i>
              {category}
            </div>
          </div>
          
          <div className="header-actions">
            <div className="location-indicator">
              {userLocation ? (
                <span className="location-active">
                  <i className="fas fa-location-dot"></i>
                  Your Location
                </span>
              ) : (
                <span className="location-inactive">
                  <i className="fas fa-location-slash"></i>
                  No Location
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tech-location-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-gradient"></div>
          </div>
          
          <div className="hero-content">
            <h1 className="hero-title">
              Find <span className="highlight">{subService}</span> Experts
            </h1>
            <p className="hero-subtitle">
              Professional {subService.toLowerCase()} services in your area. 
              Connect with verified technicians ready to help.
            </p>
            
            <div className="search-controls">
              <div className="distance-selector-wrapper">
                <div 
                  className="distance-selector-btn"
                  onClick={() => setShowDistanceModal(!showDistanceModal)}
                >
                  <i className="fas fa-ruler-combined"></i>
                  <span>Search Radius: {distanceTiers.find(t => t.value === distanceTier)?.label}</span>
                  <i className={`fas fa-chevron-${showDistanceModal ? 'up' : 'down'}`}></i>
                </div>
                
                {showDistanceModal && (
                  <div className="distance-modal">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>Select Search Radius</h3>
                        <button 
                          onClick={() => setShowDistanceModal(false)}
                          className="modal-close"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="distance-options">
                        {distanceTiers.map(tier => (
                          <div
                            key={tier.value}
                            className={`distance-option ${distanceTier === tier.value ? 'selected' : ''}`}
                            onClick={() => handleDistanceTierChange(tier.value)}
                          >
                            <div className="option-icon">
                              <i className={tier.icon}></i>
                            </div>
                            <div className="option-info">
                              <span className="option-label">{tier.label}</span>
                              <span className="option-count">
                                {technicianCounts[tier.value] || 0} available
                              </span>
                            </div>
                            {distanceTier === tier.value && (
                              <i className="fas fa-check selected-icon"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={getUserLocation}
                className="refresh-btn"
                disabled={loading}
              >
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        {!loading && !error && (
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">{technicians.length}</div>
              <div className="stat-label">Total Technicians</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">{responseData.premiumCount || 0}</div>
              <div className="stat-label">Premium</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">{responseData.regularCount || 0}</div>
              <div className="stat-label">Regular</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">
                <i className="fas fa-bolt"></i>
                {distanceTiers.find(t => t.value === distanceTier)?.label}
              </div>
              <div className="stat-label">Search Radius</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <i className="fas fa-exclamation-triangle"></i>
              <p>{error}</p>
              <button onClick={getUserLocation} className="retry-btn">
                <i className="fas fa-redo"></i>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-inner"></div>
              </div>
              <p>Finding technicians near you...</p>
              <small>Searching within {distanceTiers.find(t => t.value === distanceTier)?.label.toLowerCase()}</small>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && !error && technicians.length > 0 && (
          <section className="results-section">
            <div className="section-header">
              <h2>Available Technicians</h2>
              <div className="sort-controls">
                <span className="sort-label">Sort by:</span>
                <select className="sort-select">
                  <option>Relevance</option>
                  <option>Distance</option>
                  <option>Rating</option>
                  <option>Price</option>
                </select>
              </div>
            </div>

            <div className="technicians-grid">
              {technicians.map(technician => (
                <div 
                  key={technician._id} 
                  className={`technician-card ${technician.isPremiumActive ? 'premium' : 'regular'}`}
                >
                  {/* Premium/Featured Badges */}
                  <div className="card-badges">
                    {technician.isPremiumActive && (
                      <div className="badge premium-badge">
                        <i className="fas fa-crown"></i>
                        Premium
                      </div>
                    )}
                    {technician.isFeaturedActive && (
                      <div className="badge featured-badge">
                        <i className="fas fa-star"></i>
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Technician Header */}
                  <div className="tech-header">
                    <div className="tech-avatar">
                      <img 
                        src={technician.profilePicture || 'https://i.pravatar.cc/150'} 
                        alt={technician.username}
                      />
                      <div className="status-indicator active"></div>
                    </div>
                    
                    <div className="tech-meta">
                      <h3 className="tech-name">{technician.username}</h3>
                      <p className="tech-profession">
                        {technician.professions?.[0] || 'Professional Technician'}
                      </p>
                      
                      <div className="tech-rating">
                        <div className="stars">
                          {'★★★★★'.slice(0, Math.floor(technician.rating?.average || 0))}
                          <span className="empty-stars">
                            {'★'.repeat(5 - Math.floor(technician.rating?.average || 0))}
                          </span>
                        </div>
                        <span className="rating-value">
                          {technician.rating?.average?.toFixed(1) || '0.0'}
                        </span>
                        <span className="reviews">
                          ({technician.rating?.count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Distance Info */}
                  {technician.displayDistance && (
                    <div className="distance-info">
                      <i className="fas fa-location-dot"></i>
                      <span>{technician.displayDistance.toFixed(1)} km away</span>
                      {technician.isPremiumActive && (
                        <span className="premium-note">
                          <i className="fas fa-bolt"></i>
                          Premium visibility
                        </span>
                      )}
                    </div>
                  )}

                  {/* Services */}
                  <div className="services-section">
                    <label className="section-label">Services Offered</label>
                    <div className="services-tags">
                      {technician.subServices?.slice(0, 3).map((service, index) => (
                        <span key={index} className="service-tag">{service}</span>
                      ))}
                      {technician.subServices?.length > 3 && (
                        <span className="service-tag more">
                          +{technician.subServices.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Rates */}
                  <div className="info-grid">
                    <div className="info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{technician.address?.city || 'Location not specified'}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>Response time: 15 mins</span>
                    </div>
                    {technician.projectRateCategory && (
                      <div className="info-item price">
                        <i className="fas fa-tag"></i>
                        <span className="price-range">
                          {technician.projectRateCategory === 'under_10000' && 'Under Ksh 10,000'}
                          {technician.projectRateCategory === '10000_to_100000' && 'Ksh 10,000-100,000'}
                          {technician.projectRateCategory === '100000_to_1000000' && 'Ksh 100,000-1M'}
                          {technician.projectRateCategory === 'over_1000000' && 'Over Ksh 1M'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button 
                      className="contact-btn"
                      onClick={() => handleContact(technician._id)}
                    >
                      <i className="fas fa-message"></i>
                      Message
                    </button>
                    <button 
                      className="profile-btn"
                      onClick={() => handleViewProfile(technician._id)}
                    >
                      <i className="fas fa-user"></i>
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {!loading && !error && technicians.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">
                <i className="fas fa-user-slash"></i>
              </div>
              <h3>No Technicians Found</h3>
              <p>
                We couldn't find any {subService.toLowerCase()} technicians within 
                {distanceTiers.find(t => t.value === distanceTier)?.label.toLowerCase()}.
              </p>
              <div className="empty-actions">
                <button 
                  onClick={() => handleDistanceTierChange('100+')}
                  className="expand-btn"
                >
                  <i className="fas fa-expand-alt"></i>
                  Expand Search Area
                </button>
                <button 
                  onClick={() => navigate('/category')}
                  className="browse-btn"
                >
                  <i className="fas fa-th-large"></i>
                  Browse Categories
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Premium Feature Banner */}
        {!loading && technicians.length > 0 && (
          <div className="premium-banner">
            <div className="banner-content">
              <div className="banner-icon">
                <i className="fas fa-crown"></i>
              </div>
              <div className="banner-text">
                <h4>Get Your Service Noticed</h4>
                <p>Premium technicians appear first and receive more client requests.</p>
              </div>
              <button 
                onClick={() => navigate('/premium')}
                className="premium-btn"
              >
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianLocation;