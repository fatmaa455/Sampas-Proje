// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import MessagePage from './components/MessagePage';
import UsersPage from './components/UsersPage';
import UpdateUserPage from './components/UpdateUserPage';
import AddUserPage from './components/AddUserPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/message" element={<MessagePage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/updateUser/:userId" element={<UpdateUserPage />} />
                <Route path="/addUser" element={<AddUserPage />} />
            </Routes>
        </Router>
    );
}

export default App;
