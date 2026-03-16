import api from '../../services/api';

// Stats & Analytics
export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAnalytics = async (days = 30) => {
  const response = await api.get(`/admin/analytics?days=${days}`);
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get('/admin/activity');
  return response.data;
};

export const getVisitorLogs = async (params) => {
  const response = await api.get('/admin/visitor-logs', { params });
  return response.data;
};

// User Management
export const getUsers = async (params) => {
  const response = await api.get('/admin/users', { params });
  return response.data; // { users, total, page, pages }
};

export const getUserDetails = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data; // { user, transfers, matches }
};

export const suspendUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/suspend`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// Transfer Management
export const getTransfers = async (params) => {
  const response = await api.get('/admin/transfers', { params });
  return response.data; // { transfers, total, page, pages }
};

export const deleteTransfer = async (id) => {
  const response = await api.delete(`/admin/transfers/${id}`);
  return response.data;
};

// Match Management
export const getMatches = async (params) => {
  const response = await api.get('/admin/matches', { params });
  return response.data; // { matches, total, page, pages }
};

export const deleteMatch = async (id) => {
  const response = await api.delete(`/admin/matches/${id}`);
  return response.data;
};
