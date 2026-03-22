import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.accessToken) {
    localStorage.setItem('aimtpUser', JSON.stringify(response.data));
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.accessToken) {
    localStorage.setItem('aimtpUser', JSON.stringify(response.data));
  }
  return response.data;
};

export const googleLogin = async (token) => {
  const response = await api.post('/auth/google', { token });
  if (response.data.accessToken) {
    localStorage.setItem('aimtpUser', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('aimtpUser');
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  // Update local storage user object
  const sessionString = localStorage.getItem('aimtpUser');
  if (sessionString) {
    const session = JSON.parse(sessionString);
    if (session.user) {
      session.user = { ...session.user, ...response.data.user };
      localStorage.setItem('aimtpUser', JSON.stringify(session));
    }
  }
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

export const sendVerificationOtp = async () => {
  const response = await api.post('/auth/send-verification-otp');
  return response.data;
};

export const verifyEmailOtp = async (otp) => {
  const response = await api.post('/auth/verify-email-otp', { otp });
  // Update local storage user object so UI updates immediately without refetch
  const sessionString = localStorage.getItem('aimtpUser');
  if (sessionString) {
    const session = JSON.parse(sessionString);
    if (session.user) {
      session.user.verified = true;
      localStorage.setItem('aimtpUser', JSON.stringify(session));
    }
  }
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};

export const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  const response = await api.post('/auth/upload-profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Update local storage user object so UI updates immediately
  const sessionString = localStorage.getItem('aimtpUser');
  if (sessionString) {
    const session = JSON.parse(sessionString);
    if (session.user) {
      session.user.profileImage = response.data.profileImage;
      localStorage.setItem('aimtpUser', JSON.stringify(session));
    }
  }
  
  return response.data;
};

export const updateProfileImageUrl = async (profileImage) => {
  const response = await api.post('/auth/update-profile-image', { profileImage });
  
  // Update local storage user object
  const sessionString = localStorage.getItem('aimtpUser');
  if (sessionString) {
    const session = JSON.parse(sessionString);
    if (session.user) {
      session.user.profileImage = response.data.profileImage;
      localStorage.setItem('aimtpUser', JSON.stringify(session));
    }
  }
  
  return response.data;
};
