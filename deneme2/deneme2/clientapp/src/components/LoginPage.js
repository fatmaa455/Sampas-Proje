//src/components/LoginPage.js

import React, { useState } from 'react';
import { login } from '../services/api';
import './LoginPage.css'; 
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Kullanıcı adı ve şifre gereklidir.');
            return;
        }

        try {
            const response = await login(username, password);
            console.log('Login response:', response);

            sessionStorage.setItem('authToken', response.token);
            sessionStorage.setItem('kullaniciAdi', username);

            navigate('/home');
        } catch (error) {
            setError('Giriş başarısız');
        }
    };

    return (
        <div className="login-page">
            <h1>Giriş Yap</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Kullanıcı Adı</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Şifre</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Giriş Yap</button>
            </form>
        </div>
    );
}

export default LoginPage;
