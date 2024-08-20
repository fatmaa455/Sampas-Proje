import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchUserById } from '../services/api'; 
import './UpdateUserPage.css';
import * as signalR from '@microsoft/signalr';
import { updateUser } from '../services/api';

function UpdateUserPage() {
    const { userId } = useParams(); // URL'den güncellenecek kullanıcı ID'sini alın
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        // SignalR bağlantısı oluşturma

        // token ve username'yi storageden alma
        const token = sessionStorage.getItem('authToken');
        const username = sessionStorage.getItem('kullaniciAdi');
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

                // Kullanıcı güncellemesi olduğunda tetiklenecek metod, anlık güncelleme sağlar
                newConnection.on("ReceiveUserUpdate", (updatedUser) => {
                    // Güncellenen kullanıcı bilgilerini kontrol edin
                    if (parseInt(userId) === updatedUser.id) {
                        setUser(updatedUser); // Ekrandaki kullanıcı bilgilerini güncelle
                    }
                });
            })
            .catch((err) => console.error('SignalR bağlantısı kurulamadı:', err));

        // url'den alınan userId ile user'ı bulma
        const getUser = async () => {
            try {
                const userData = await fetchUserById(userId);
                console.log(userData);
                setUser(userData);
            } catch (error) {
                setError('Kullanıcı bilgileri alınamadı.');
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        getUser();

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [userId]); // userId değiştiğinde yeniden çalışacak fonksiyon

    // Formdaki herhangi bir input alanında yapılan değişiklikleri user state'ine yansır ve form verileri güncel kalır
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
            const newUser = await updateUser(user);
            if (connection) {
                await connection.invoke("UpdateUser", newUser);
                navigate('/users'); // Güncelleme başarılı ise kullanıcılar sayfasına yönlendir
            }
        } catch (error) {
            setError('Güncelleme işlemi başarısız.');
            console.error('Error updating user:', error);
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
                    <div className="update-user-page">
                        <header className="header">
                            <h1>Kullanıcı Bilgilerini Güncelle</h1>
                        </header>
                        {loading ? (
                            <p>Yükleniyor...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="update-form">
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
                                <button type="submit">Güncelle</button>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UpdateUserPage;
