import React, { useEffect, useState } from 'react';
import { fetchUsers, deleteUser } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import './UsersPage.css';
import * as signalR from '@microsoft/signalr';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const getUsers = async () => {
            try {
                console.log('Fetching users...');
                const userData = await fetchUsers();
                console.log('Users fetched successfully:', userData);
                setUsers(userData || []); // Varsayılan olarak boş dizi kullan
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        getUsers();

        // SignalR bağlantısını kurma
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

                newConnection.on("ReceiveUserUpdate", (updatedUser) => {
                    console.log('Kullanıcı güncellendi:', updatedUser);

                    // Güncellenen kullanıcıyı listede bulup güncelleme
                    setUsers((prevUsers) =>
                        prevUsers.map((user) =>
                            user && user.id === updatedUser.id ? updatedUser : user
                        )
                    );
                });

                newConnection.on("ReceiveUserAdd", (newUser) => {
                    console.log('Kullanıcı eklendi:', newUser);

                    // Yeni kullanıcıyı listeye ekleme
                    setUsers((prevUsers) => [...prevUsers, newUser]);
                });

                newConnection.on("ReceiveUserDelete", (id) => {
                    console.log('Kullanıcı silindi:', id);

                    // Yeni kullanıcıyı listeden silme
                    setUsers((prevUsers) => prevUsers.filter(user => user && user.id !== id));
                });
            })
            .catch((err) => console.error('SignalR bağlantısı kurulamadı:', err));

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, []);

    const handleLogout = () => {
        if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            navigate('/login'); // Giriş sayfasına yönlendir
        }
    };

    // Silme butonuna basınca tetiklenecek olay
    const handleDelete = async (id) => {
        if (window.confirm('Silmek istediğinize emin misiniz?')) {
            try {
                await deleteUser(id);
                if (connection) {
                    await connection.invoke("DeleteUser", id);
                }
                navigate('/users');
            } catch (error) {
                console.error('Error deleting user:', error);
            }
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
                    {loading ? (
                        <p>Yükleniyor...</p>
                    ) : (
                        <div>
                            <Link to="/addUser">Kullanıcı Ekle</Link>
                            <h2>Kullanıcılar:</h2>
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Ad</th>
                                        <th>Soyad</th>
                                        <th>Kullanıcı Adı</th>
                                        <th>Email</th>
                                        <th>Güncelleme</th>
                                        <th>Silme</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.filter(user => user).map(user => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.surname}</td>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <Link to={`/updateUser/${user.id}`}>Güncelle</Link>
                                            </td>
                                            <td>
                                                <button className="logout-button" onClick={() => handleDelete(user.id)}>
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default UsersPage;
