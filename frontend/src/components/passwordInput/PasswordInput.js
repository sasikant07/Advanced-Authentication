import React, { useState } from 'react';
import {AiOutlineEyeInvisible, AiOutlineEye} from "react-icons/ai"
import "./PasswordInput.scss";

const PasswordInput = ({placeholder, value, onChange, name, onPaste}) => {
  const [showpassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showpassword);
  }

  return (
    <div className="password">
      <input 
        type={showpassword ? "text" : "password"} 
        name={name} 
        placeholder={placeholder}
        value={value} 
        onChange={onChange}
        onPaste={onPaste}
      />
      <div className="icon" onClick={togglePassword}>
        {showpassword ? (
          <AiOutlineEyeInvisible size={20} />
        ) : (
          <AiOutlineEye size={20} />
        )}
      </div>
    </div>
  )
}

export default PasswordInput;