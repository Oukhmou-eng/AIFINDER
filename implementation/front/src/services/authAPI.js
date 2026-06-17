import api, { setToken, getToken } from './api';

export const AuthAPI = {
  async login(email, password) {
    const data = await api.post('login', { email, password });
    setToken(data.token);
    return data;
  },

  async userComments() {
    const data = await api.get('user_comments');
    return data.comments || [];
  },

  async register(payload) {
    return api.post('register', payload);
  },

  async googleAuth(credential) {
    const data = await api.post('google_auth', { credential });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  async me() {
    if (!getToken()) return null;
    const data = await api.get('me');
    return data.user;
  },

  async updateProfile(data) {
    return api.post('update_user', data);
  },

  async changePassword(currentPassword, newPassword) {
    return api.post('change_password', { currentPassword, newPassword });
  },

  async deleteAccount() {
    return api.post('delete_user');
  },

  logout() {
    setToken(null);
  },

  isLoggedIn() {
    return Boolean(getToken());
  },
};

export default AuthAPI;
