import React from 'react'
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';

function ProfileInfoCard() {
    const {user, clearUser} = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/");
    };

  return(
    user && (
        <div className="flex items-center gap-3 cursor-pointer">
            <img src={user.profileImageUrl}
            alt="" 
            className="w-11 h-11 bg-gray-300 rounded-full mr-3"
            />
            <div className="cla">
                <div className="text-[15xl] font-bold text-black leading-3">
                    {user.name || ""}
                </div>
                <button 
                onClick={handleLogout}
                className="text-amber-600 text-sm font-semibold cursor-pointer hover:underline"
                >
                    Logout
                </button>
            </div>
        </div>
    )
  )
}

export default ProfileInfoCard
