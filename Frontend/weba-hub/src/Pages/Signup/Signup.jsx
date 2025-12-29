import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup = ({ onSuccessfulSignup }) => {
    const navigate = useNavigate();
    
    const initialFormState = {
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        userType: 'client',
        category: '',
        services: [], // Changed from subServices to services
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    };

    const [formData, setFormData] = useState(initialFormState);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const showProfessionalFields = formData.userType === 'technician';

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/api/users/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setMessage({ text: 'Failed to load categories', type: 'error' });
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Update selected category when category changes
    useEffect(() => {
        if (formData.category) {
            const category = categories.find(cat => cat.name === formData.category);
            setSelectedCategory(category);
            // Reset services when category changes
            setFormData(prev => ({ ...prev, services: [] }));
        } else {
            setSelectedCategory(null);
        }
    }, [formData.category, categories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    const handleUserTypeChange = (e) => {
        setFormData(prev => ({ 
            ...prev, 
            userType: e.target.value,
            category: '',
            services: []
        }));
    };

    const handleCategoryChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            category: value,
            services: [] // Reset services when category changes
        }));
    };

    const handleServiceChange = (serviceName) => {
        setFormData(prev => {
            const currentServices = [...prev.services];
            const index = currentServices.indexOf(serviceName);
            
            if (index > -1) {
                // Remove if already selected
                currentServices.splice(index, 1);
            } else {
                // Add if not selected
                currentServices.push(serviceName);
            }
            
            return { ...prev, services: currentServices };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Validate required fields
            if (!formData.username || !formData.password || !formData.email || !formData.phoneNumber) {
                throw new Error('Please fill in all required fields');
            }

            // Validate professional fields for technicians
            if (showProfessionalFields) {
                if (!formData.category) {
                    throw new Error('Please select your category');
                }
                if (formData.services.length === 0) {
                    throw new Error('Please select at least one service');
                }
            }

            const response = await axios.post('http://localhost:5000/api/users/register', formData);

            setMessage({ text: 'Registration successful!', type: 'success' });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                onSuccessfulSignup?.(response.data.user);
                navigate('/my-application');
            } else {
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
            setMessage({ text: errorMsg, type: 'error' });
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderBasicInfo = () => (
        <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
                <label>Username*</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div className="form-group">
                <label>Email*</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div className="form-group">
                <label>Password*</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                />
            </div>
            
            <div className="form-group">
                <label>Phone Number*</label>
                <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div className="form-group">
                <label>Account Type*</label>
                <div className="user-type-selector">
                    <label>
                        <input
                            type="radio"
                            name="userType"
                            value="client"
                            checked={formData.userType === 'client'}
                            onChange={handleUserTypeChange}
                        />
                        <span>Client</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="userType"
                            value="technician"
                            checked={formData.userType === 'technician'}
                            onChange={handleUserTypeChange}
                        />
                        <span>Service Provider</span>
                    </label>
                </div>
            </div>
        </div>
    );

    const renderProfessionalInfo = () => {
        if (!showProfessionalFields) return null;

        return (
            <div className="form-section">
                <h3>Professional Information</h3>
                
                <div className="form-group">
                    <label>Category*</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                        required
                        disabled={categoriesLoading}
                    >
                        <option value="">Select your category</option>
                        {categories.map(category => (
                            <option key={category._id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {categoriesLoading && <div className="loading-text">Loading categories...</div>}
                </div>

                {selectedCategory && (
                    <div className="form-group">
                        <label>Services* (Select the services you offer)</label>
                        <div className="services-container">
                            {selectedCategory.services.map((service, index) => (
                                <label key={index} className="service-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.services.includes(service.name)}
                                        onChange={() => handleServiceChange(service.name)}
                                    />
                                    <span>{service.name}</span>
                                </label>
                            ))}
                        </div>
                        {formData.services.length === 0 && (
                            <div className="error-text">Please select at least one service</div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderLocationInfo = () => (
        <div className="form-section">
            <h3>Location Information</h3>
            <div className="form-group">
                <label>Street Address*</label>
                <input
                    type="text"
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    required
                />
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>City*</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.address.city}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>State*</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.address.state}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>ZIP Code*</label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.address.zipCode}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="signup-container">
            <h2>Create Your Account</h2>
            <p className="signup-subtitle">Join as a client or service provider</p>
            
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="signup-form">
                {renderBasicInfo()}
                {renderProfessionalInfo()}
                {renderLocationInfo()}
                
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner"></span> Creating Account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>

                <p className="login-prompt">
                    Already have an account? <a href="/login">Log in</a>
                </p>
            </form>
        </div>
    );
};

export default Signup;