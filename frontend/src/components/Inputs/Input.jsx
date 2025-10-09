import React, { useState } from 'react'
import {FaRegEye, FaRegEyeSlash} from 'react-icons/fa6'
function Input({value, onChange, lable, placeholder, type}) {

    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };
  return (
    <div>
        <lable className="text-[13px] text-slate-800">{lable}</lable>

        <div className="input-box">
            <input
                type={
                    type == "password" ? (showPassword ? "text" : "password") : type
                }
                placeholder={placeholder}
                className="w-full bg-transparent outline-none"
                value={value}
                onChange={(e) => onChange(e)}
            />

            {type === "password" && (
                <>
                    {showPassword ? (
                        <FaRegEye
                        size={22}
                        className="text-orange-300 cursor-pointer"
                        onClick={() => toggleShowPassword()}
                        />
                    ) : (
                        <FaRegEyeSlash
                        size={22}
                        className="text-slate-400 cursor-pointer"
                        onClick={() => toggleShowPassword()}
                        />
                    )}
                </>
            )}
        </div>
    </div>
  )
};
export default Input
