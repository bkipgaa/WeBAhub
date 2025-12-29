// Category.js - Enhanced Version
import React from "react";
import { Link } from "react-router-dom";
import "./Category.css";

const Category = ({ userType }) => {
  const categories = [
    { 
      id: 'internet', 
      label: 'IT & Networking', 
      icon: 'fas fa-network-wired',
      color: 'var(--primary)',
      gradient: 'var(--gradient-primary)'
    },
    { 
      id: 'electrical', 
      label: 'Electrical Services', 
      icon: 'fas fa-bolt',
      color: 'var(--warning)',
      gradient: 'linear-gradient(135deg, #f8961e, #f9c74f)'
    },
    { 
      id: 'programming', 
      label: 'Programming', 
      icon: 'fas fa-code',
      color: 'var(--secondary)',
      gradient: 'var(--gradient-secondary)'
    },
    { 
      id: 'beauty', 
      label: 'Beauty', 
      icon: 'fas fa-spa',
      color: 'var(--accent)',
      gradient: 'var(--gradient-accent)'
    },
  ];

  return (
    <div className="category-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find Expert Technicians Near You</h1>
          <p className="hero-subtitle">
            Connect with skilled professionals for all your service needs. 
            Fast, reliable, and quality work guaranteed.
          </p>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="What service do you need today?"
              className="search-input"
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="floating-card">
            <i className="fas fa-tools"></i>
          </div>
          <div className="floating-card">
            <i className="fas fa-wifi"></i>
          </div>
          <div className="floating-card">
            <i className="fas fa-bolt"></i>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Popular Service Categories</h2>
          <p>Browse our most requested services</p>
        </div>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={category.id}
              className="category-card"
              style={{ '--category-color': category.color }}
            >
              <div 
                className="card-icon"
                style={{ background: category.gradient }}
              >
                <i className={category.icon}></i>
              </div>
              <h3 className="card-title">{category.label}</h3>
              <p className="card-description">
                Professional services for all your {category.label.toLowerCase()} needs
              </p>
              <div className="card-footer">
                <span className="card-cta">
                  View Technicians
                  <i className="fas fa-arrow-right"></i>
                </span>
              </div>
            </Link>
          ))}
          
          {/* Profile Card */}
          {userType && (
            <Link 
              to={userType === 'technician' ? '/technician-profile' : '/client-profile'}
              className="category-card profile-card"
            >
              <div className="card-icon profile-icon">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3 className="card-title">My Profile</h3>
              <p className="card-description">
                Manage your {userType === 'technician' ? 'technician' : 'client'} profile and settings
              </p>
              <div className="card-footer">
                <span className="card-cta">
                  Go to Profile
                  <i className="fas fa-arrow-right"></i>
                </span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Expert Technicians</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1hr</div>
            <div className="stat-label">Average Response Time</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Category;