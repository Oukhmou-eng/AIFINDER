// frontend/src/services/authAPI.js
import { postForm } from '../api'; // si tu as une méthode postForm (x-www-form-urlencoded)

export const AuthAPI = {
  login: async (email, password) => {
    const data = await postForm('/index.php', { action: 'login', email, password });
    if (data.success) {
      localStorage.setItem('token', data.token); // ← stocke le token
    }
    return data;
  },
  register: async (email, password, nom) => {
    return postForm('/index.php', { action: 'register', email, password, nom });
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
};