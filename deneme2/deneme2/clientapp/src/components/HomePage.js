// src/components/HomePage.js
import React, { useEffect, useState } from 'react';
import { fetchUsers } from '../services/api';
import { Link , useNavigate} from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Tüm kullanıcılar api.js fetchUsers metodundan çekilir
    useEffect(() => {
        const getUsers = async () => {
            try {
                console.log('Fetching users...'); 
                const userData = await fetchUsers();
                console.log('Users fetched successfully:', userData); 
                setUsers(userData);
            } catch (error) {
                console.error('Error fetching users:', error); 
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    // Çıkış yapılınca login sayfasına yönlendirme yapan metot
    const handleLogout = () => {
        if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            navigate('/login'); // Giriş sayfasına yönlendir
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
                    <h1>Hoşgeldiniz!</h1>
                    {loading ? (
                        <p>Yükleniyor...</p>
                    ) : (
                        <div>
                            <h2>Kullanıcılar:</h2>
                            <ul>
                                {users.map(user => (
                                    <li key={user.id}>
                                        <Link
                                            to="/message"
                                            onClick={() => sessionStorage.setItem('selectedUserId', user.id)}
                                            className="kullanicilar"
                                        >
                                            {user.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default HomePage;
