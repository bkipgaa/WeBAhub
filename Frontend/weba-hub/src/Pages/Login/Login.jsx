// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password
            });

            // Check if response has the expected structure
            if (response.data && response.data.token && response.data.user) {
                setMessage('Login successful!');
                
                // Store token and user data in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                console.log('Login successful, user data:', response.data.user);
                console.log('User ID received:', response.data.user.id);

                // CALL THE onLogin FUNCTION TO UPDATE APP STATE
                if (onLogin) {
                    onLogin({
                        token: response.data.token,
                        username: response.data.user.username,
                        userType: response.data.user.userType,
                        email: response.data.user.email,
                        id: response.data.user.id || response.data.user._id
                    });
                }   
                
                // Redirect based on user type or to profile
                if (response.data.user.userType === 'technician') {
                    navigate(`/technician-profile`);
                } else {
                    navigate('/client-profile'); // Or wherever clients go
                }
                
            } else {
                setMessage('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage(error.response?.data?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                 <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default Login;
