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

  async reviews(toolId) {
    const data = await api.get('reviews', { toolId });
    return data.reviews || [];
  },

  async createReview(payload) {
    const data = await api.post('create_review', payload);
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

  async notifications() {
    const data = await api.get('notifications');
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
