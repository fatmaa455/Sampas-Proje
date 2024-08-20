// src/services/api.js
import axios from 'axios';
// react uygulamalarında http istekleri yapmak için kullanılan js kütüphanesi

const API_URL = 'http://localhost:5146/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Apiden tüm kullanıcıları çeken metot
export const fetchUsers = async () => {
    try {
        const url = '/AppUsers';
        console.log('Fetching users from:', API_URL + url); // URL'yi logla
        const response = await api.get(url);
        console.log('API Response Status:', response.status); // Yanıt durum kodunu logla
        console.log('API Response Data:', response.data); // Yanıt verisini logla
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error.message); // Hata mesajını logla
        throw error;
    }
};

// Kullanıcı bilgilerine göre apiden giriş yanıtını alan metot
export const login = async (username, password) => {
    try {
        const url = '/Auth/login';

        const user = {
            id: 0, 
            name: '', 
            surname: '',
            username: username,
            email: '', 
            password: password,
            roleId: 0
        };

        console.log('Logging in with:', API_URL + url);
        const response = await api.post(url, user);
        console.log('API Response Status:', response.status);
        console.log('API Response Data:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error logging in:', error.message);
        throw error;
    }
};

/*
// Mesaj gönderme
export const sendMessage = async (receiverId, message) => {
    try {
        // URL'yi dinamik olarak user.id ile oluşturuyoruz
        const url = `/Messages/send?receiverId=${receiverId}&message=${encodeURIComponent(message)}`;
        const response = await api.post(url);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error.message);
        throw error;
    }
};
*/
/*
export const getMessages = async () => {
    return api.get('/messages');
};
*/

// Id'ye göre kullanıcıyı çekme 
export const fetchUserById = async (userId) => {
    try {
        const url = `/AppUsers/${userId}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        throw error;
    }
};

// Kullanıcı güncelleme
export const updateUser = async (user) => {
    try {
        // URL'yi dinamik olarak user.id ile oluşturuyoruz
        const url = `/AppUsers/${user.id}`;
        const response = await api.put(url, user);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error.message);
        throw error;
    }
};

// Kullanıcı ekleme
export const addUser = async (user) => {
    try {
        const url = `/AppUsers`;
        const response = await api.post(url,user);
        return response.data;
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        throw error;
    }
};

// Kullanıcı silme
export const deleteUser = async (id) => {
    try {
        const url = `/AppUsers/${id}`;
        const response = await api.delete(url,id);
        return response.data;
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        throw error;
    }
};
