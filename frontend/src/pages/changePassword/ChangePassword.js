import React, { useState } from 'react'
import Card from '../../components/card/Card';
import profileImg from "../../assets/avatar.png";
import "./ChangePassword.scss";
import Pagemenu from '../../components/pageMenu/Pagemenu';
import PasswordInput from '../../components/passwordInput/PasswordInput';

const initialState = {
    oldPassword: "",
    password: "",
    password2: "",
}

const ChangePassword = () => {
  const [formData, setFormData] = useState(initialState);
  const {oldPassword, password, password2} = formData;

  const handleInputChange = (e) => {

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
                <form>
                  <p>
                    <label>Current Password:</label>
                    <PasswordInput 
                        name="oldPassword" 
                        placeholder="Old Password" 
                        value={oldPassword} 
                        onChange={handleInputChange}
                    />
                  </p>
                  <p>
                    <label>New Password:</label>
                    <PasswordInput 
                        name="password" 
                        placeholder="New Password" 
                        value={password} 
                        onChange={handleInputChange}
                    />
                  </p>
                  <p>
                    <label>Confirm New Password:</label>
                    <PasswordInput 
                        name="password2" 
                        placeholder="Confirm New Password" 
                        value={password2} 
                        onChange={handleInputChange}
                    />
                  </p>
                  <button className="--btn --btn-danger --btn-block">Change Password</button>
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