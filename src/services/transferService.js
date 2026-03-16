import api from './api';

export const createTransfer = async (transferData) => {
  const response = await api.post('/transfers', transferData);
  return response.data;
};

export const getMyTransfers = async () => {
  const response = await api.get('/transfers/my');
  return response.data;
};

export const searchTransfers = async (params) => {
  const response = await api.get('/transfers/search', { params });
  return response.data;
};

export const deleteTransfer = async (id) => {
  const response = await api.delete(`/transfers/${id}`);
  return response.data;
};

export const getTransferById = async (id) => {
  const response = await api.get(`/transfers/${id}`);
  return response.data;
};

export const updateTransfer = async (id, transferData) => {
  const response = await api.put(`/transfers/${id}`, transferData);
  return response.data;
};

export const getPublicTransfers = async () => {
  const response = await api.get('/transfers/public');
  return response.data;
};
