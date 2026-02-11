import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import { validateEmail } from '../../utils/helper';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage from '../../utils/uploadImage';
function Signup({setCurrentPage}) {

  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    if(!fullName){
      setError("Please enter your full name")
      return;
    }

    if(!validateEmail(email)){
      setError("Please enter your email")
      return;
    }

    if(!password || password.length < 8){
      setError("Password must be at least 8 characters")
      return;
    }

    setError("");

    // signup API call 
    try{
      if(profilePic){
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName, 
        email, 
        password, 
        profileImageUrl
      });
      const { token } = response.data;

      if(token){
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard" );
      }

    }catch (error){
      if(error.response && error.response.data.message){
        setError(error.response.data.message)
      }else{
        setError("Something went wrong. Please try again")
      }
    }

  }
  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Create an account</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-6">Join us today by filling out the form below</p>

      <form onSubmit={handleSignup}>

        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
          <Input
            value={fullName}
            onChange={({ target }) => setFullName(target.value)}
            lable="Full Name"
            placeholder="Enter your full name"
            type="text"
          />

          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            lable="Email Address"
            placeholder="Enter your email"
            type="email"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            lable="Password"
            placeholder="Min 8 characters"
            type="password"
          />
        </div>

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button 
        type="submit" 
        className="w-full bg-black text-sm font-semibold text-white py-2.5 px-7 rounded-lg hover:bg-amber-600 hover:text-white border border-white transition-colors cursor-pointer">
          Sign Up
        </button>

        <p className="text-[13px] text-slate-600 mt-3">
          Already have an account?{" "}
          <button
            type="button"
            className="font-medium text-amber-600 underline cursor-pointer"
            onClick={() => {
              setCurrentPage('login');
            }}
          >
            Login
          </button>
        </p>

      </form>

    </div>
  )
}

export default Signup
