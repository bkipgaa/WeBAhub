import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import TechnicianLocation from './Components/TechnicianLocation/TechnicianLocation';

import Home from './Pages/Home/Home';
import Category from './Pages/Category/Category';
import Internet_IT from './Pages/Internet_IT/Internet';
import MyApplication from './Pages/My-Application/MyApps';
import Shifts from './Pages/Shifts/Shifts';
import InternetStatus from './Pages/InternetStatus/InternetStatus';
import Chat from './Pages/Chats/Chats';
import Login from './Pages/Login/Login';
import Signup from './Pages/Signup/Signup';
import TechnicianProfile from './Protected_Apps/TechnicianProfile/TechnicianProfile';
import TechnicianTickets from './Protected_Apps/Tickets/TechnicianTickets';
import ClientProfile from './Protected_Apps/ClientProfile/ClientProfile';
import TechCategoryProfile from './Pages/TechCategoryProfile/TechCategoryProfile';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [userType, setUserType] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');

    // Check for existing authentication on app load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                handleLogin(user);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
            }
        }
    }, []);

    const handleLogin = (user) => {
        setIsAuthenticated(true);
        setUsername(user.username);
        setUserType(user.userType);
        setEmail(user.email);
        setUserId(user.id || user._id);
        
        // Store in localStorage for persistence
        localStorage.setItem('token', user.token || 'dummy-token'); // Replace with actual token from your API
        localStorage.setItem('userData', JSON.stringify({
            username: user.username,
            userType: user.userType,
            email: user.email,
            id: user.id || user._id
        }));
        
        console.log('User logged in:', user.username, 'ID:', user.id || user._id);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUsername('');
        setUserType('');
        setEmail('');
        setUserId('');
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        console.log('User logged out');
    };

    return (
        <Router>
            <Navbar 
                isAuthenticated={isAuthenticated} 
                username={username} 
                userType={userType}
                email={email}
                id={userId}
                onLogout={handleLogout} 
                onLogin={handleLogin}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Category routes */}
                <Route path="/category" element={<Category />}>
                    <Route path="internet" element={<Internet_IT />} />
                </Route>
                
                {/* My Application routes */}
                <Route path="/my-application" element={
                    isAuthenticated ? (
                        <MyApplication />
                    ) : (
                        <Navigate to="/login" />
                    )
                }>
                    <Route path="tickets" element={
                        isAuthenticated && userType === 'technician' ? (
                            <TechnicianTickets username={username} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    } />
                </Route>

                {/* Technician profile routes */}
                <Route 
                    path="/technician-profile" 
                    element={
                        isAuthenticated && userType === 'technician' ? (
                            <TechnicianProfile />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                {/* Public technician profile view */}
                <Route path="/techniciancategoryprofile/:id" element={<TechCategoryProfile />} />
                
                {/* Client profile route */}
                <Route 
                    path="/client-profile" 
                    element={
                        isAuthenticated && userType === 'client' ? (
                            <ClientProfile userId={userId} username={username} userType={userType} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                
                {/* Public routes */}
                <Route path="/nearbytechnician" element={<TechnicianLocation />} />
                <Route path="/shifts" element={<Shifts />} />
                <Route path="/internet-status" element={<InternetStatus />} />
                <Route path="/chat" element={<Chat />} />
                
                {/* Auth routes */}
                <Route 
                    path="/login" 
                    element={
                        !isAuthenticated ? (
                            <Login onLogin={handleLogin} />
                        ) : (
                            <Navigate to="/" />
                        )
                    } 
                />
                <Route 
                    path="/signup" 
                    element={
                        !isAuthenticated ? (
                            <Signup />
                        ) : (
                            <Navigate to="/" />
                        )
                    } 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;