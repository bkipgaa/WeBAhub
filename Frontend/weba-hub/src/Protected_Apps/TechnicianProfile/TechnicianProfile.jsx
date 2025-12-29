import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TechnicianProfile.css';

// Axios interceptor for automatic token handling
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const TechnicianProfile = ({ userId }) => {
  const navigate = useNavigate();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ address: {} });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modal visibility states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Form states for new sections
  const [newEducation, setNewEducation] = useState({
    institution: '',
    educationType: '',
    fieldOfStudy: '',
    graduationYear: '',
    description: ''
  });
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuedBy: '',
    issueYear: '',
    expirationYear: '',
    credentialId: '',
    credentialUrl: ''
  });
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: '',
    yearsOfExperience: ''
  });
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    projectUrl: '',
    technologies: '',
    projectDate: ''
  });

  const isOwner = () => true;

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please log in to view your profile');
          setLoading(false);
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/profile/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setTechnician(response.data);
        setEditForm(response.data);
        
      } catch (err) {
        console.error('Error fetching profile:', err);
        const errorMessage = err.response?.data?.message || 
                            'Failed to load your profile. Please try logging in again.';
        setError(errorMessage);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleArrayChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setEditForm(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        'http://localhost:5000/api/profile/update',
        editForm
      );

      setTechnician(response.data.user);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploadingImage(true);
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.put(
        'http://localhost:5000/api/profile/picture',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setTechnician(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));
      setEditForm(prev => ({
        ...prev,
        profilePicture: response.data.profilePicture
      }));

      alert('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // New functions for handling additions
  const handleAddEducation = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/profile/education',
        newEducation
      );

      setTechnician(prev => ({ ...prev, education: response.data.education }));
      setNewEducation({
        institution: '',
        educationType: '',
        fieldOfStudy: '',
        graduationYear: '',
        description: ''
      });
      setShowEducationModal(false);
      alert('Education added successfully!');
    } catch (err) {
      console.error('Error adding education:', err);
      alert(err.response?.data?.message || 'Failed to add education');
    }
  };

  const handleAddCertification = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/profile/certifications',
        newCertification
      );

      setTechnician(prev => ({ ...prev, certifications: response.data.certifications }));
      setNewCertification({
        name: '',
        issuedBy: '',
        issueYear: '',
        expirationYear: '',
        credentialId: '',
        credentialUrl: ''
      });
      setShowCertificationModal(false);
      alert('Certification added successfully!');
    } catch (err) {
      console.error('Error adding certification:', err);
      alert(err.response?.data?.message || 'Failed to add certification');
    }
  };

  const handleAddSkill = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/profile/skills',
        newSkill
      );

      setTechnician(prev => ({ ...prev, skills: response.data.skills }));
      setNewSkill({
        name: '',
        level: '',
        yearsOfExperience: ''
      });
      setShowSkillModal(false);
      alert('Skill added successfully!');
    } catch (err) {
      console.error('Error adding skill:', err);
      alert(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleAddProject = async () => {
    try {
      const projectData = {
        ...newProject,
        technologies: newProject.technologies.split(',').map(t => t.trim()).filter(t => t)
      };

      const response = await axios.post(
        'http://localhost:5000/api/profile/portfolio',
        projectData
      );

      setTechnician(prev => ({ ...prev, portfolio: response.data.portfolio }));
      setNewProject({
        title: '',
        description: '',
        projectUrl: '',
        technologies: '',
        projectDate: ''
      });
      setShowProjectModal(false);
      alert('Project added to portfolio!');
    } catch (err) {
      console.error('Error adding project:', err);
      alert(err.response?.data?.message || 'Failed to add project');
    }
  };

  const handleRemoveItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to remove this ${type}?`)) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/profile/${type}/${id}`
      );

      setTechnician(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item._id !== id)
      }));
      
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`);
    } catch (err) {
      console.error(`Error removing ${type}:`, err);
      alert(err.response?.data?.message || `Failed to remove ${type}`);
    }
  };

  const handleUpdateIntroVideo = async () => {
    try {
      const response = await axios.put(
        'http://localhost:5000/api/profile/intro-video',
        { videoUrl: editForm.introVideo }
      );

      setTechnician(prev => ({ ...prev, introVideo: response.data.introVideo }));
      alert('Intro video updated successfully!');
    } catch (err) {
      console.error('Error updating intro video:', err);
      alert(err.response?.data?.message || 'Failed to update intro video');
    }
  };

  const getProfilePicture = () => {
    if (technician?.profilePicture) {
      if (technician.profilePicture.startsWith('http')) {
        return technician.profilePicture;
      }
      return `http://localhost:5000${technician.profilePicture}`;
    }
    return 'https://i.pravatar.cc/150';
  };

  const getMainProfession = () => {
    if (technician?.profession) return technician.profession;
    if (technician?.professions?.length > 0) return technician.professions[0];
    return 'Professional Technician';
  };

  const getServicesToDisplay = () => {
    if (technician?.subServices?.length > 0) return technician.subServices;
    if (technician?.services?.length > 0) return technician.services;
    if (technician?.professions?.length > 0) return technician.professions;
    return [];
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal')) {
        setShowProjectModal(false);
        setShowEducationModal(false);
        setShowCertificationModal(false);
        setShowSkillModal(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) return <div className="loading">Loading technician profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!technician) return <div className="error">Technician not found</div>;

  const servicesToDisplay = getServicesToDisplay();
  const mainProfession = getMainProfession();
  const profilePictureUrl = getProfilePicture();

  return (
    <div className="technician-profile">
      <div className="profile-header-actions">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        
        {isOwner() && !isEditing && (
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            <i className="fas fa-edit"></i> Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        /* EDIT MODE */
        <div className="edit-profile-form">
          <div className="form-section">
            <h2>Edit Profile</h2>
            
            {/* Profile Information Section */}
            <div className="profile-info-section">
              <div className="profile-image-upload">
                <div className="form-group">
                  <label>Profile Picture</label>
                  <div className="image-upload-section">
                    <img 
                      src={getProfilePicture()} 
                      alt="Profile" 
                      className="profile-preview"
                    />
                    <div className="upload-controls">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      {uploadingImage && <span>Uploading...</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-details-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editForm.phoneNumber || ''}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Project Rate Category</label>
                    <select
                      name="projectRateCategory"
                      value={editForm.projectRateCategory || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Rate Category</option>
                      <option value="under_10000">Under Ksh 10,000</option>
                      <option value="10000_to_100000">Ksh 10,000 - 100,000</option>
                      <option value="100000_to_1000000">Ksh 100,000 - 1,000,000</option>
                      <option value="over_1000000">Over Ksh 1,000,000</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Professions & Skills</label>
                  <input
                    type="text"
                    value={editForm.professions?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('professions', e.target.value)}
                    placeholder="e.g., Electrician, Plumbing, Carpentry, Network Installation"
                    className="professions-input"
                  />
                  <small className="input-hint">Separate multiple professions with commas</small>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="address-section">
              <h3 className="section-title">
                <i className="fas fa-map-marker-alt"></i>
                Address Information
              </h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={editForm.address?.street || ''}
                    onChange={handleAddressChange}
                    placeholder="Enter your street address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={editForm.address?.city || ''}
                    onChange={handleAddressChange}
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State/Region *</label>
                  <input
                    type="text"
                    name="state"
                    value={editForm.address?.state || ''}
                    onChange={handleAddressChange}
                    placeholder="State or Region"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ZIP/Postal Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={editForm.address?.zipCode || ''}
                    onChange={handleAddressChange}
                    placeholder="ZIP or Postal Code"
                  />
                </div>
                
                <div className="form-group">
                  <label>Country</label>
                  <select
                    name="country"
                    value={editForm.address?.country || 'Kenya'}
                    onChange={handleAddressChange}
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="additional-info-section">
              <h3 className="section-title">
                <i className="fas fa-info-circle"></i>
                Additional Information
              </h3>
              
              <div className="form-group full-width">
                <label>About Me & Professional Summary</label>
                <textarea
                  name="about"
                  value={editForm.about || ''}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Tell clients about your experience, expertise, and what makes you unique as a technician..."
                  className="about-textarea"
                />
                <small className="input-hint">
                  This will be displayed on your public profile. Share your experience, specialties, and approach to work.
                </small>
              </div>

              <div className="form-group full-width">
                <label>Intro Video URL</label>
                <div className="video-input-group">
                  <input
                    type="text"
                    name="introVideo"
                    value={editForm.introVideo || ''}
                    onChange={handleInputChange}
                    placeholder="Paste YouTube, Vimeo, or other video URL"
                    className="video-url-input"
                  />
                  <button 
                    className="save-video-btn"
                    onClick={handleUpdateIntroVideo}
                    type="button"
                  >
                    <i className="fas fa-save"></i> Save Video
                  </button>
                </div>
                <small className="input-hint">
                  Add a video introduction to showcase your work and personality (YouTube, Vimeo, etc.)
                </small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button 
                className="save-btn" 
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(technician);
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (





        /* VIEW MODE */
        <>
          {/* MAIN PROFILE HEADER */}
          <div className="profile-main-header">
            <div className="profile-avatar-section">
              <div className="profile-image-container">
                <div className="profile-image">
                  <img 
                    src={profilePictureUrl} 
                    alt={technician.username}
                    onError={(e) => {
                      e.target.src = 'https://i.pravatar.cc/150';
                    }}
                  />
                </div>
                <div className="profile-title-info">
                  <h1 className="profile-name">{technician.username}</h1>
                  <p className="profession">{mainProfession}</p>
                  <div className="rating">
                    <span className="stars">⭐ {technician.rating?.average?.toFixed(1) || '0.0'}</span>
                    <span className="reviews">({technician.rating?.count || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-contact-info">
              <div className="contact-info-card">
                <h3 className="contact-title">Contact Information</h3>
                <div className="contact-details">
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
                    <div className="contact-content">
                      <span className="contact-label">Email</span>
                      <span className="contact-value">{technician.email || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="contact-content">
                      <span className="contact-label">Phone</span>
                      <span className="contact-value">{technician.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <div className="contact-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-content">
                      <span className="contact-label">Location</span>
                      <span className="contact-value">
                        {technician.address?.street && `${technician.address.street}, `}
                        {technician.address?.city && `${technician.address.city}, `}
                        {technician.address?.state && `${technician.address.state}`}
                        {technician.address?.zipCode && ` ${technician.address.zipCode}`}
                        {!technician.address?.street && !technician.address?.city && 
                        !technician.address?.state && 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>




          {/* SERVICES AND RATE SECTION */}
          <div className="profile-services-section">
            <div className="services-card">
              <h3><i className="fas fa-tools"></i> Services Offered</h3>
              <div className="services-list">
                {servicesToDisplay.length > 0 ? (
                  servicesToDisplay.map((service, index) => (
                    <span key={index} className="service-tag">{service}</span>
                  ))
                ) : (
                  <p className="no-services">No services listed</p>
                )}
              </div>
            </div>

            {technician.userType === 'technician' && (
              <div className="rate-card">
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




          {/* PROFILE CONTENT SECTIONS */}
          <div className="profile-content-sections">
            {/* About Section */}
            <div className="content-section">
              <div className="section-header">
                <h2>About Me</h2>
                {isOwner() && (
                  <button 
                    className="section-edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                )}
              </div>
              <div className="section-content">
                {technician.about ? (
                  <p className="about-text">{technician.about}</p>
                ) : (
                  <div className="empty-section">
                    <i className="fas fa-user fa-2x"></i>
                    <p>No information provided about this technician.</p>
                    {isOwner() && (
                      <button 
                        className="add-content-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        Add About Section
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>



            {/* Portfolio Section */}
            <div className="content-section">
              <div className="section-header">
                <h2>Portfolio</h2>
                {isOwner() && (
                  <button 
                    className="section-add-btn"
                    onClick={() => setShowProjectModal(true)}
                  >
                    <i className="fas fa-plus"></i> Add Project
                  </button>
                )}
              </div>
              <div className="section-content">
                {technician.portfolio?.length > 0 ? (
                  <div className="portfolio-grid">
                    {technician.portfolio.map((project) => (
                      <div key={project._id} className="portfolio-item">
                        <h4>{project.title}</h4>
                        <p>{project.description}</p>
                        {project.projectUrl && (
                          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                            View Project
                          </a>
                        )}
                        {isOwner() && (
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveItem('portfolio', project._id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section">
                    <i className="fas fa-briefcase fa-2x"></i>
                    <p>No portfolio projects yet.</p>
                    {isOwner() && (
                      <button 
                        className="add-content-btn"
                        onClick={() => setShowProjectModal(true)}
                      >
                        Start Portfolio
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>


            

            {/* Education Section */}
            <div className="content-section">
              <div className="section-header">
                <h2>Education</h2>
                {isOwner() && (
                  <button 
                    className="section-add-btn"
                    onClick={() => setShowEducationModal(true)}
                  >
                    <i className="fas fa-plus"></i> Add Education
                  </button>
                )}
              </div>
              <div className="section-content">
                {technician.education?.length > 0 ? (
                  <div className="education-list">
                    {technician.education.map((edu) => (
                      <div key={edu._id} className="education-item">
                        <div className="item-main">
                          <h4>{edu.institution}</h4>
                          <p className="item-details">{edu.fieldOfStudy} - {edu.educationType}</p>
                          <p className="item-meta">Graduated: {edu.graduationYear}</p>
                          {edu.description && <p className="item-description">{edu.description}</p>}
                        </div>
                        {isOwner() && (
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveItem('education', edu._id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section">
                    <i className="fas fa-graduation-cap fa-2x"></i>
                    <p>No education information added.</p>
                    {isOwner() && (
                      <button 
                        className="add-content-btn"
                        onClick={() => setShowEducationModal(true)}
                      >
                        Add Education
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Certifications Section */}
            <div className="content-section">
              <div className="section-header">
                <h2>Certifications</h2>
                {isOwner() && (
                  <button 
                    className="section-add-btn"
                    onClick={() => setShowCertificationModal(true)}
                  >
                    <i className="fas fa-plus"></i> Add Certification
                  </button>
                )}
              </div>
              <div className="section-content">
                {technician.certifications?.length > 0 ? (
                  <div className="certifications-list">
                    {technician.certifications.map((cert) => (
                      <div key={cert._id} className="certification-item">
                        <div className="item-main">
                          <h4>{cert.name}</h4>
                          <p className="item-details">Issued by: {cert.issuedBy}</p>
                          <p className="item-meta">Year: {cert.issueYear}</p>
                          {cert.expirationYear && <p className="item-meta">Expires: {cert.expirationYear}</p>}
                        </div>
                        {isOwner() && (
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveItem('certifications', cert._id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section">
                    <i className="fas fa-certificate fa-2x"></i>
                    <p>No certifications added.</p>
                    {isOwner() && (
                      <button 
                        className="add-content-btn"
                        onClick={() => setShowCertificationModal(true)}
                      >
                        Add Certification
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="content-section">
              <div className="section-header">
                <h2>Skills & Experience</h2>
                {isOwner() && (
                  <button 
                    className="section-add-btn"
                    onClick={() => setShowSkillModal(true)}
                  >
                    <i className="fas fa-plus"></i> Add Skill
                  </button>
                )}
              </div>
              <div className="section-content">
                {technician.skills?.length > 0 ? (
                  <div className="skills-grid">
                    {technician.skills.map((skill) => (
                      <div key={skill._id} className="skill-item">
                        <div className="skill-main">
                          <h4>{skill.name}</h4>
                          <div className="skill-details">
                            <span className={`skill-level level-${skill.level}`}>
                              {skill.level}
                            </span>
                            <span className="skill-experience">
                              {skill.yearsOfExperience} years experience
                            </span>
                          </div>
                        </div>
                        {isOwner() && (
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveItem('skills', skill._id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-section">
                    <i className="fas fa-tools fa-2x"></i>
                    <p>No skills added yet.</p>
                    {isOwner() && (
                      <button 
                        className="add-content-btn"
                        onClick={() => setShowSkillModal(true)}
                      >
                        Add Skill
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Intro Video Section */}
            <div className="content-section">
              <div className="section-header">
                <h2>Intro Video</h2>
                {isOwner() && (
                  <button 
                    className="section-edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                )}
              </div>
              <div className="section-content">
                {technician.introVideo ? (
                  <div className="video-container">
                    <iframe
                      src={technician.introVideo}
                      title="Intro Video"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                    {isOwner() && (
                      <button 
                        className="remove-btn"
                        onClick={() => {
                          setEditForm(prev => ({ ...prev, introVideo: '' }));
                          handleUpdateIntroVideo();
                        }}
                      >
                        Remove Video
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="empty-section">
                    <i className="fas fa-video fa-2x"></i>
                    <p>No intro video added.</p>
                    {isOwner() && (
                      <button 
                        className="add-content-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        Add Intro Video
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isOwner() && !isEditing && (
        <>
          {/* Add Project Modal */}
          {showProjectModal && (
            <div className="modal" onClick={(e) => e.target.classList.contains('modal') && setShowProjectModal(false)}>
              <div className="modal-content">
                <span className="close" onClick={() => setShowProjectModal(false)}>&times;</span>
                <h3>Add Portfolio Project</h3>
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
                <textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Project URL (optional)"
                  value={newProject.projectUrl}
                  onChange={(e) => setNewProject({...newProject, projectUrl: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Technologies (comma separated)"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                />
                <input
                  type="date"
                  value={newProject.projectDate}
                  onChange={(e) => setNewProject({...newProject, projectDate: e.target.value})}
                />
                <div className="modal-actions">
                  <button onClick={handleAddProject}>Add Project</button>
                  <button onClick={() => setShowProjectModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Education Modal */}
          {showEducationModal && (
            <div className="modal" onClick={(e) => e.target.classList.contains('modal') && setShowEducationModal(false)}>
              <div className="modal-content">
                <span className="close" onClick={() => setShowEducationModal(false)}>&times;</span>
                <h3>Add Education</h3>
                <input
                  type="text"
                  placeholder="Institution Name"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                />
                <select
                  value={newEducation.educationType}
                  onChange={(e) => setNewEducation({...newEducation, educationType: e.target.value})}
                >
                  <option value="">Select Type</option>
                  <option value="degree">Degree</option>
                  <option value="diploma">Diploma</option>
                  <option value="certificate">Certificate</option>
                </select>
                <input
                  type="text"
                  placeholder="Field of Study"
                  value={newEducation.fieldOfStudy}
                  onChange={(e) => setNewEducation({...newEducation, fieldOfStudy: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Graduation Year"
                  value={newEducation.graduationYear}
                  onChange={(e) => setNewEducation({...newEducation, graduationYear: e.target.value})}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                />
                <div className="modal-actions">
                  <button onClick={handleAddEducation}>Add Education</button>
                  <button onClick={() => setShowEducationModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Certification Modal */}
          {showCertificationModal && (
            <div className="modal" onClick={(e) => e.target.classList.contains('modal') && setShowCertificationModal(false)}>
              <div className="modal-content">
                <span className="close" onClick={() => setShowCertificationModal(false)}>&times;</span>
                <h3>Add Certification</h3>
                <input
                  type="text"
                  placeholder="Certification Name"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Issued By"
                  value={newCertification.issuedBy}
                  onChange={(e) => setNewCertification({...newCertification, issuedBy: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Issue Year"
                  value={newCertification.issueYear}
                  onChange={(e) => setNewCertification({...newCertification, issueYear: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Expiration Year (optional)"
                  value={newCertification.expirationYear}
                  onChange={(e) => setNewCertification({...newCertification, expirationYear: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Credential ID (optional)"
                  value={newCertification.credentialId}
                  onChange={(e) => setNewCertification({...newCertification, credentialId: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Credential URL (optional)"
                  value={newCertification.credentialUrl}
                  onChange={(e) => setNewCertification({...newCertification, credentialUrl: e.target.value})}
                />
                <div className="modal-actions">
                  <button onClick={handleAddCertification}>Add Certification</button>
                  <button onClick={() => setShowCertificationModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Skill Modal */}
          {showSkillModal && (
            <div className="modal" onClick={(e) => e.target.classList.contains('modal') && setShowSkillModal(false)}>
              <div className="modal-content">
                <span className="close" onClick={() => setShowSkillModal(false)}>&times;</span>
                <h3>Add Skill</h3>
                <input
                  type="text"
                  placeholder="Skill Name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                />
                <select
                  value={newSkill.level}
                  onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                >
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
                <input
                  type="number"
                  placeholder="Years of Experience"
                  value={newSkill.yearsOfExperience}
                  onChange={(e) => setNewSkill({...newSkill, yearsOfExperience: e.target.value})}
                />
                <div className="modal-actions">
                  <button onClick={handleAddSkill}>Add Skill</button>
                  <button onClick={() => setShowSkillModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TechnicianProfile;