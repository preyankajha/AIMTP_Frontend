import api from './api';

export const getMasterData = async () => {
  const response = await api.get('/master-data/public');
  return response.data;
};
