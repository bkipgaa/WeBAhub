// Navbar.js - Enhanced Version
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import UserIcon from '../UserIcon/UserIcon';

function Navbar({ isAuthenticated, username, userType, email, id, onLogout, onLogin }) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleProfileNavigation = () => {
        navigate(userType === 'technician' ? '/technician-profile' : '/client-profile');
    };

    const handleNearbyTechsClick = () => navigate('/category');
    const handleMyApplicationClick = () => navigate('/my-application');

    const handleUserIconLogin = (userData) => onLogin?.(userData);
    const handleUserIconLogout = () => {
        onLogout?.();
        navigate('/');
    };

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Technicians Near Me', action: handleNearbyTechsClick },
        { label: 'My Application', action: handleMyApplicationClick },
        { label: 'Shifts', path: '/shifts' },
        { label: 'Internet Status', path: '/internet-status' },
        { label: 'Chat', path: '/chat' },
    ];

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Logo/Brand */}
                    <div className="navbar-brand">
                        <Link to="/" className="logo">
                            <div className="logo-icon">
                                <i className="fas fa-tools"></i>
                            </div>
                            <span className="logo-text">TechConnect</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>

                    {/* Navigation Links */}
                    <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                        <ul>
                            {navItems.map((item, index) => (
                                <li key={index}>
                                    {item.path ? (
                                        <Link 
                                            to={item.path}
                                            className="nav-link"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                            <span className="link-underline"></span>
                                        </Link>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                item.action();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="nav-button"
                                        >
                                            {item.label}
                                            <span className="link-underline"></span>
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* User Section */}
                    <div className="user-section">
                        <UserIcon 
                            isAuthenticated={isAuthenticated}
                            username={username}
                            email={email}
                            userType={userType}
                            onLogin={handleUserIconLogin}
                            userId={id}
                            onLogout={handleUserIconLogout}
                            onProfileNavigate={handleProfileNavigation}
                        />
                    </div>
                </div>
            </nav>
            
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
}

export default Navbar;