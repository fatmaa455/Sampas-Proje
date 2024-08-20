import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { Link } from 'react-router-dom';
import './MessagePage.css';

function MessagePage() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [receiverId, setReceiverId] = useState(null);
    const [connection, setConnection] = useState(null);

    // Storage de tutulan mesaj göndermek istediğimiz user id receiverId parametresine atanır
    useEffect(() => {
        const storedReceiverId = sessionStorage.getItem('selectedUserId');
        if (storedReceiverId) {
            setReceiverId(Number(storedReceiverId));
            console.log("Receiver ID from sessionStorage:", storedReceiverId);
        }
    }, []);

    // SignalR bağlantı işlemleri
    useEffect(() => {
        // Storage den giriş yapılan oturum bilgileri (kullanıcı adı, token) alınır
        const token = sessionStorage.getItem('authToken');
        const username = sessionStorage.getItem('kullaniciAdi');

        // Yeni bir hub bağlantısı oluşturulur , bu hub bağlantısı url 'ine username de eklenir
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5146/chathub?username=" + encodeURIComponent(username), {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        // hub'ı dinler ReceiveMessage'den dönüş geldiğinde çalışır
        newConnection.on("ReceiveMessage", (messageReceiverId, senderId, message) => {
            console.log("Received message:", message, "from sender ID:", senderId, "to receiver ID:", messageReceiverId);

            // Yalnızca geçerli receiverId'ye sahip mesajları ekleyin
            // Karşı kullanıcının mesaj content'ine ekleme  yapar
            if (messageReceiverId === receiverId) {
                setMessages(messages => [...messages, { content: message, sender: senderId }]);
            }
        });

        newConnection.start()
            .then(() => {
                console.log("SignalR connected!");
            })
            .catch(e => console.log("SignalR connection error: ", e));

        return () => {
            newConnection.stop();
        };
    }, [receiverId]);  // receiverId değiştiğinde useEffect tekrar çalışacak

    const handleSend = async () => {
        if (!newMessage.trim() || receiverId === null) {
            return;
        }
        try {
            if (connection) {
                // Hub daki SendMessage metodu çağırılır
                await connection.invoke("SendMessage", receiverId, newMessage);

                // Ekranda göstermek için local state'e de ekleyin
                // Şuanki kullanıcının mesaj content'ine ekleme  yapar
                setMessages(messages => [...messages, { content: newMessage, sender: 'Me' }]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Mesaj gönderilemedi:', error);
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
                <main>
                    <div className="message-page">
                        <div className="messages-list">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.sender === 'Me' ? 'my-message' : 'other-message'}`}
                                >
                                    {msg.content}
                                </div>
                            ))}
                        </div>
                        <div className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Mesajınızı yazın..."
                            />
                            <button onClick={handleSend}>Gönder</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default MessagePage;
