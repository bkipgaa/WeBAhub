// UserIcon.js - Modern Version
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserIcon.css';

function UserIcon({ isAuthenticated, username, userType, email, onLogin, onLogout, onProfileNavigate }) {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleLoginClick = () => navigate('/login');
    const handleRegisterClick = () => navigate('/signup');

    const handleProfileClick = () => {
        if (userType === 'technician') {
            navigate('/technician-profile');
        } else if (userType === 'client') {
            navigate('/client-profile');
        } else {
            navigate('/profile');
        }
        if (onProfileNavigate) onProfileNavigate();
        setShowDropdown(false);
    };

    const handleLogoutClick = () => {
        if (onLogout) onLogout();
        setShowDropdown(false);
        navigate('/');
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const getUserColor = (type) => {
        switch (type) {
            case 'technician': return 'var(--primary)';
            case 'client': return 'var(--accent)';
            default: return 'var(--gray-600)';
        }
    };

    return (
        <div className="user-icon-container" ref={dropdownRef}>
            {!isAuthenticated ? (
                <div className="auth-section">
                    <button onClick={handleLoginClick} className="auth-btn login-btn">
                        <i className="fas fa-sign-in-alt"></i>
                        <span>Login</span>
                    </button>
                    <button onClick={handleRegisterClick} className="auth-btn register-btn">
                        <i className="fas fa-user-plus"></i>
                        <span>Register</span>
                    </button>
                </div>
            ) : (
                <div className="user-section">
                    <div 
                        className="user-avatar-container"
                        onClick={toggleDropdown}
                        style={{ '--user-color': getUserColor(userType) }}
                    >
                        <div className="user-avatar">
                            {getInitials(username)}
                        </div>
                        <div className="user-greeting">
                            <span className="greeting">Hello,</span>
                            <span className="username">{username || 'User'}</span>
                        </div>
                        <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
                    </div>

                    {showDropdown && (
                        <div className="user-dropdown">
                            <div className="dropdown-header">
                                <div className="header-avatar">
                                    {getInitials(username)}
                                </div>
                                <div className="header-info">
                                    <div className="header-username">{username}</div>
                                    <div className="header-email">{email}</div>
                                    <div className="header-role">
                                        <span className="role-badge">{userType}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dropdown-divider"></div>

                            <div className="dropdown-menu">
                                <button onClick={handleProfileClick} className="dropdown-item">
                                    <i className="fas fa-user"></i>
                                    <span>My Profile</span>
                                </button>
                                
                                <button className="dropdown-item">
                                    <i className="fas fa-cog"></i>
                                    <span>Settings</span>
                                </button>
                                
                                <button className="dropdown-item">
                                    <i className="fas fa-question-circle"></i>
                                    <span>Help & Support</span>
                                </button>

                                <div className="dropdown-divider"></div>

                                <button onClick={handleLogoutClick} className="dropdown-item logout">
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default UserIcon;