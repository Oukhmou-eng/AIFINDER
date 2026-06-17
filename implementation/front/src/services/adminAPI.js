import api from './api';

export const AdminAPI = {
  async dashboard() {
    return api.get('admin_dashboard');
  },

  async getUserSubmissions(userId) {
    return api.get('admin_user_submissions', { userId });
  },
  async getUserReviews(userId) {
    return api.get('admin_user_reviews', { userId });
  },

  async updateTool(id, data) {
    return api.post('admin_update_tool', { id, ...data });
  },

  async users() {
    return api.get('admin_users');
  },

  async tools(params = {}) {
    return api.get('admin_tools', params);
  },


  async categories() {
    return api.get('admin_categories');
  },

  async createCategory(data) {
    return api.post('admin_create_category', data);
  },

  async updateCategory(data) {
    return api.post('admin_update_category', data);
  },

  async deleteCategory(id) {
    return api.post('admin_delete_category', { id_Cat: id });
  },

  async addToolToCategory(toolId, categoryId) {
    return api.post('admin_add_tool_to_category', { toolId, categoryId });
  },
  async removeToolFromCategory(toolId, categoryId) {
    return api.post('admin_remove_tool_from_category', { toolId, categoryId });
  },

  async models() {
    return api.get('admin_models');
  },

  async providers() {
    return api.get('admin_providers');
  },

  async features() {
    return api.get('admin_features');
  },

  async plans() {
    return api.get('admin_plans');
  },

  async createModel(data) {
    return api.post('admin_create_model', data);
  },

  async updateModel(data) {
    return api.post('admin_update_model', data);
  },

  async deleteModel(id) {
    return api.post('admin_delete_model', { idMod: id });
  },

  async notifications() {
    return api.get('admin_notifications');
  },

  async sendNotification(data) {
    return api.post('admin_send_notification', data);
  },

  async deleteNotification(data) {
    return api.post('admin_delete_notification', data);
  },

  async reports() {
    return api.get('admin_reports');
  },

  async updateReportStatus(id, status) {
    return api.post('admin_update_report_status', { id, status });
  },

  async submissions(params = {}) {
    return api.get('admin_submissions', params);
  },

  async approveTool(id, note = '') {
    return api.post('admin_approve_tool', { id, note });
  },

  async rejectTool(id, reason = '') {
    return api.post('admin_reject_tool', { id, reason });
  },

  async deleteTool(id) {
    return api.post('admin_delete_tool', { id });
  },

  async createTool(data) {
    return api.post('admin_create_tool', data);
  },

  async validateTool(id) {
    return api.post('admin_validate_tool', { id });
  },
};

export default AdminAPI;
