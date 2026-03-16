import api from './api';

export const getMyMatches = async () => {
  const response = await api.get('/matches/my');
  return response.data;
};

export const revealContact = async (matchId) => {
  const response = await api.post('/matches/reveal-contact', { matchId });
  return response.data;
};
