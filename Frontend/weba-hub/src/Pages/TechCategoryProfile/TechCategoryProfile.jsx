import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TechCategoryProfile.css';

const TechnicianProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechnician = async () => {
      try {
        setLoading(true);
        // Updated endpoint to match backend route
        const response = await axios.get(`http://localhost:5000/api/users/profile/${id}`);
        console.log('Technician data received:', response.data); // Debug log
        
        setTechnician(response.data);
      } catch (err) {
        console.error('Error fetching technician:', err);
        setError(err.response?.data?.message || 'Failed to load technician profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnician();
  }, [id]);

  const handleContact = () => {
    if (technician && technician.email) {
      window.location.href = `mailto:${technician.email}?subject=Service Inquiry`;
    }
  };

  // Helper function to get main profession
  const getMainProfession = () => {
    if (technician?.profession) {
      return technician.profession;
    }
    if (technician?.professions?.length > 0) {
      return technician.professions[0];
    }
    return 'Professional Technician';
  };

  // Helper function to get services to display
  const getServicesToDisplay = () => {
    if (technician?.subServices && technician.subServices.length > 0) {
      return technician.subServices;
    }
    if (technician?.services && technician.services.length > 0) {
      return technician.services;
    }
    if (technician?.professions && technician.professions.length > 0) {
      return technician.professions;
    }
    return [];
  };

  // Helper function to get profile picture URL
  const getProfilePicture = () => {
    if (technician?.profilePicture) {
      // If it's a full URL, use it directly, otherwise prepend the backend URL
      if (technician.profilePicture.startsWith('http')) {
        return technician.profilePicture;
      }
      return `http://localhost:5000${technician.profilePicture}`;
    }
    return 'https://i.pravatar.cc/150';
  };

  if (loading) return <div className="loading">Loading technician profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!technician) return <div className="error">Technician not found</div>;

  const servicesToDisplay = getServicesToDisplay();
  const mainProfession = getMainProfession();
  const profilePictureUrl = getProfilePicture();

  return (
    <div className="technician-profile">
      <button className="back-button" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i> Back
      </button>

      <div className="profile-header">
        {/* Left Side - Basic Info */}
        <div className="profile-basic-info">
          <div className="profile-image">
            <img 
              src={profilePictureUrl} 
              alt={technician.username}
              onError={(e) => {
                e.target.src = 'https://i.pravatar.cc/150';
              }}
            />
          </div>
          <div className="basic-info">
            <h1>{technician.username}</h1>
            <p className="profession">{mainProfession}</p>
            
            <div className="rating">
              <span className="stars">⭐ {technician.rating?.average?.toFixed(1) || '0.0'}</span>
              <span className="reviews">({technician.rating?.count || 0} reviews)</span>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-envelope"></i> 
              <span>{technician.email || 'Email not provided'}</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i> 
              <span>{technician.phoneNumber || 'Phone not provided'}</span>
            </div>

            {technician.email && (
              <button className="contact-btn-large" onClick={handleContact}>
                <i className="fas fa-envelope"></i> Contact Technician
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Key Details */}
        <div className="key-details-sidebar">
          <div className="key-detail-section">
            <h3><i className="fas fa-map-marker-alt"></i> Location</h3>
            <p>
              {technician.address?.street && `${technician.address.street}, `}
              {technician.address?.city && `${technician.address.city}, `}
              {technician.address?.state && `${technician.address.state} `}
              {technician.address?.zipCode && technician.address.zipCode}
              {!technician.address?.street && !technician.address?.city && 
               !technician.address?.state && 'Location not specified'}
            </p>
          </div>

          <div className="key-detail-section">
            <h3><i className="fas fa-tools"></i> Services Offered</h3>
            <div className="services-list">
              {servicesToDisplay.length > 0 ? (
                servicesToDisplay.map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
                ))
              ) : (
                <p>No services listed</p>
              )}
            </div>
          </div>

          {technician.userType === 'technician' && (
            <div className="key-detail-section">
              <h3><i className="fas fa-money-bill-wave"></i> Project Rate</h3>
              <p className="rate-display">
                {technician.projectRateCategory === 'under_10000' && 'Under Ksh 10,000'}
                {technician.projectRateCategory === '10000_to_100000' && 'Ksh 10,000 - 100,000'}
                {technician.projectRateCategory === '100000_to_1000000' && 'Ksh 100,000 - 1,000,000'}
                {technician.projectRateCategory === 'over_1000000' && 'Over Ksh 1,000,000'}
                {!technician.projectRateCategory && 'Rate not specified'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* About Section (Below) */}
      <div className="profile-details">
        <div className="detail-section">
          <h3>About {technician.username}</h3>
          <p>{technician.about || 'No information provided about this technician.'}</p>
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfile;