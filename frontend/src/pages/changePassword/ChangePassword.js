import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Card from '../../components/card/Card';
import profileImg from "../../assets/avatar.png";
import "./ChangePassword.scss";
import Pagemenu from '../../components/pageMenu/Pagemenu';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import useRedirectLoggedOutUser from '../../customHook/useRedirectLoggedOutUser';
import { RESET, changePassword, logout } from '../../redux/features/auth/authSlice';
import { Spinner } from '../../components/loader/Loader';
import { sendAutomatedEmail } from '../../redux/features/email/emailSlice';

const initialState = {
    oldPassword: "",
    password: "",
    password2: "",
}

const ChangePassword = () => {
  useRedirectLoggedOutUser("/login");
  const [formData, setFormData] = useState(initialState);
  const {oldPassword, password, password2} = formData;
  const {isLoading, user} = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !password || !password2) {
      return toast.error("All fields are required");
    }

    if (password !== password2) {
      return toast.error("Passwords doesn't match");
    }

    const userData = {
      oldPassword,
      password
    }

    const emailData = {
      subject: "Password Changed - AUTH:Z",
      send_to: user.email,
      reply_to: "noreply@amazon.com",
      template: "changePassword",
      url: "/forgot"
    }

    await dispatch(changePassword(userData));
    await dispatch(sendAutomatedEmail(emailData));
    await dispatch(logout());
    await dispatch(RESET());

    navigate("/login");
  }

  return (
    <>
      <section>
        <div className="container">
          <Pagemenu />
          <h2>Change Password</h2>
          <div className="--flex-start change-password">
            <Card cardClass={"card"}>
              <>
                <form onSubmit={handleUpdatePassword}>
                  <div>
                    <label>Current Password:</label>
                    <PasswordInput 
                        name="oldPassword" 
                        placeholder="Old Password" 
                        value={oldPassword} 
                        onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>New Password:</label>
                    <PasswordInput 
                        name="password" 
                        placeholder="New Password" 
                        value={password} 
                        onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label>Confirm New Password:</label>
                    <PasswordInput 
                        name="password2" 
                        placeholder="Confirm New Password" 
                        value={password2} 
                        onChange={handleInputChange}
                    />
                  </div>
                  {isLoading ? <Spinner /> : (
                    <button type="submit" className="--btn --btn-danger --btn-block">Change Password</button>
                  )}
                </form>
              </>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

export default ChangePassword;