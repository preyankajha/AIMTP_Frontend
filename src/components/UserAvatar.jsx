import React from 'react';

/**
 * Reusable Avatar component that handles:
 * 1. Explicit profile image uploaded by user
 * 2. Designation-based fallback (Loco Pilot, Guard, SM, TTE etc.)
 * 3. Default fallback
 */
const UserAvatar = ({ user, designation, className = "h-12 w-12", shadow = false }) => {
  // 1. Resolve full URL for explicit profile image
  // This uses the SAME logic as ProfilePage.jsx for consistency
  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';
  const staticBase = apiBase.replace('/api', '');

  const profileImageUrl = user?.profileImage
    ? (user.profileImage.startsWith('http') || user.profileImage.startsWith('/avatars')
        ? user.profileImage 
        : `${staticBase}${user.profileImage}`)
    : null;

  // 2. Determine designation-based fallback
  const getDesignationAvatar = (des) => {
    if (!des) return '/avatars/default.png';
    
    // Normalize string for better matching
    const d = des.toUpperCase().replace(/[^A-Z ]/g, ''); 
    
    if (d.includes('LOCO PILOT')) return '/avatars/loco_pilot.png';
    if (d.includes('GUARD')) return '/avatars/goods_guard.png';
    if (d.includes('STATION MASTER') || d === 'SM' || d === 'ASM') return '/avatars/station_master.png';
    if (d.includes('TTE') || d.includes('TICKET EXAMINER')) return '/avatars/tte.png';
    if (d.includes('STATION')) return '/avatars/station_master.png'; // Catch-all for other station roles if needed
    
    return '/avatars/default.png';
  };

  // Determine which designation string to use
  // If user object is passed, check user.designation. 
  // If explicit designation prop is passed, use that.
  const finalDesignation = designation || user?.designation;
  const fallbackAvatar = getDesignationAvatar(finalDesignation);

  // Combine visuals
  const finalSrc = profileImageUrl || fallbackAvatar;

  return (
    <div 
      className={`
        ${className} 
        bg-white 
        rounded-2xl 
        flex 
        items-center 
        justify-center 
        border 
        border-slate-100 
        shrink-0 
        overflow-hidden 
        transition-all 
        duration-300
        ${shadow ? 'shadow-lg shadow-slate-200/50' : ''}
      `}
    >
      <img 
        src={finalSrc} 
        alt="Avatar" 
        className="w-full h-full object-cover"
        onError={(e) => { 
          // If the profile image fails to load, fallback further to default
          if (e.target.src !== '/avatars/default.png') {
            e.target.src = '/avatars/default.png'; 
          }
        }}
      />
    </div>
  );
};

export default UserAvatar;
