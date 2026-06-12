import api from './api';

export const CatalogAPI = {
  async tools(params = {}) {
    const data = await api.get('tools', params);
    return data.tools || [];
  },

  async featuredTools(limit = 6) {
    const data = await api.get('featured_tools', { limit });
    return data.tools || [];
  },

  async tool(idOrSlug) {
    const data = await api.get('tool', { slug: idOrSlug });
    return data.tool;
  },

  async categories() {
    const data = await api.get('categories');
    return data.categories || [];
  },

  async models() {
    const data = await api.get('models');
    return data.models || [];
  },

  async model(idOrSlug) {
    const data = await api.get('model', { slug: idOrSlug });
    return data.model;
  },

  async reviews(toolId) {
    const data = await api.get('reviews', { toolId });
    return data.reviews || [];
  },

  async createReview(payload) {
    const data = await api.post('create_review', payload);
    return data.reviews || [];
  },

  async myReviews() {
    const data = await api.get('my_reviews');
    return data.reviews || [];
  },

  async myProposals() {
    const data = await api.get('my_proposals');
    return data.submissions || [];
  },

  async updateReview(id, payload) {
    const data = await api.post('update_review', { id, ...payload });
    return data.reviews || [];
  },

  async deleteReview(id) {
    const data = await api.post('delete_review', { id });
    return data.reviews || [];
  },

  async report(payload) {
    const data = await api.post('report', payload);
    return data.report;
  },

  async favorite(toolId, active = true) {
    const data = await api.post('favorite', { toolId, active });
    return data.favorites || [];
  },

  async myFavorites() {
    const data = await api.get('my_favorites');
    return data.tools || [];
  },

  async notifications() {
    const data = await api.get('notifications');
    return data.notifications || [];
  },

  async markNotificationAsRead(id) {
    const data = await api.post('mark_notification_as_read', { id });
    return data.notifications || [];
  },

  async markAllNotificationsAsRead() {
    const data = await api.post('mark_all_notifications_as_read');
    return data.notifications || [];
  },

  async deleteNotification(id) {
    const data = await api.post('delete_notification', { id });
    return data.notifications || [];
  },

  async collections() {
    const data = await api.get('collections');
    return data.collections || [];
  },

  async createCollection(name, description = '') {
    const data = await api.post('create_collection', { name, description });
    return data.collections || [];
  },

  async updateCollection(id, name, description = '') {
    const data = await api.post('update_collection', { id, name, description });
    return data.collections || [];
  },

  async deleteCollection(id) {
    const data = await api.post('delete_collection', { id });
    return data.collections || [];
  },

  async addToolToCollection(collectionId, toolId) {
    const data = await api.post('add_tool_to_collection', { collectionId, toolId });
    return data.collections || [];
  },

  async removeToolFromCollection(collectionId, toolId) {
    const data = await api.post('remove_tool_from_collection', { collectionId, toolId });
    return data.collections || [];
  },

  async submitTool(payload) {
    const data = await api.post('submit_tool', payload);
    return data.submission;
  },

  async stats() {
    const data = await api.get('stats');
    return data.stats;
  },
};

export default CatalogAPI;
