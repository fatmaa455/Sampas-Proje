// src/components/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addUser } from '../services/api';
import './HomePage.css';
import * as signalR from '@microsoft/signalr';

function AddUserPage() {
    const [user, setUser] = useState({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
        roleId : ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        // Token ve username' yi storageden alma
        const token = sessionStorage.getItem('authToken');
        const username = sessionStorage.getItem('kullaniciAdi');

        // SignalR bağlantısı oluşturma
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5146/chathub?username=" + encodeURIComponent(username), {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                console.log("SignalR bağlantısı kuruldu.");

                // Hub dan dönen
                // Kullanıcı eklemesi olduğunda tetiklenecek metod
                newConnection.on("ReceiveUserAdd", (newUser) => {
                    console.log("Yeni kullanıcı eklendi:", newUser);
                    // Kullanıcı ekleme anlık olarak yönetilebilir.
                });
            })
            .catch((err) => console.error('SignalR bağlantısı kurulamadı:', err));

    }, []);

    // Anlık değişimleri yansıtma
    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser({ ...user, [name]: value });
    };

    // Çıkış yapma
    const handleLogout = () => {
        if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            navigate('/login'); // Giriş sayfasına yönlendir
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const newUser = await addUser(user); // api.js'e user'ı gönder
            if (connection) {
                await connection.invoke("AddUser", newUser);
                navigate('/users'); // Güncelleme başarılı ise kullanıcılar sayfasına yönlendir
            } // Başarılı ekleme sonrası kullanıcılar sayfasına yönlendir
        } catch (error) {
            setError('Kullanıcı ekleme başarısız.');
            console.error('Error adding user:', error);
        }
    };

    return (
        <div className="homepage">
            <div className="sidebar">
                <h2> Menü </h2>
                <ul>
                    <li><Link to="/home">Anasayfa</Link></li>
                    <li><Link to="/users">Kullanıcılar</Link></li>
                </ul>
            </div>
            <div className="content">
                <header className="header">
                    <button className="logout-button" onClick={handleLogout}>Çıkış Yap</button>
                </header>
                <main>
                    <h1>Kullanıcı Ekle</h1>
                        <div>
                            <ul>
                            <form onSubmit={handleSubmit} className="add-form">
                                <div className="form-group">
                                    <label htmlFor="name">Ad:</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={user.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="surname">Soyad:</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        name="surname"
                                        value={user.surname}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="username">Kullanıcı Adı:</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={user.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email:</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={user.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Şifre:</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={user.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="roleId">Rol Id:</label>
                                    <input
                                        type="text"
                                        id="roleId"
                                        name="roleId"
                                        value={user.roleId}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit">Ekle</button>
                            </form>
                            </ul>
                        </div>
                </main>
            </div>
        </div>
    );
}

export default AddUserPage;
