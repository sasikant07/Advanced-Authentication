import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import Card from '../../components/card/Card';
import profileImg from "../../assets/avatar.png";
import "./Profile.scss";
import Pagemenu from '../../components/pageMenu/Pagemenu';
import useRedirectLoggedOutUser from '../../customHook/useRedirectLoggedOutUser';
import { getUser } from '../../redux/features/auth/authSlice';
import Loader from '../../components/loader/Loader';

const Profile = () => {
  useRedirectLoggedOutUser("/login");
  const {isLoading, isLoggedIn, isSuccess, message, user} = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const initialState = {
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    bio: user.bio || "",
    photo: user.photo || "",
    role: user.role || "",
    isVerified:  user.is || false,
  }

  const [profile, setProfile] = useState(initialState);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const handleImageChange = (e) => {

  }

  const handleInputChange = (e) => {

  }

  return (
    <>
      <section>
        <div className="container">
          {isLoading && <Loader />}
          <Pagemenu />
          <h2>Profile</h2>
          <div className="--flex-start profile">
            <Card cardClass={"card"}>
              <>
                <div className="profile-photo">
                  <div>
                    <img src={profile?.photo} alt="Profileimg" />
                    <h3>Role: {profile.role}</h3>
                  </div>
                </div>
                <form>
                  <p>
                    <label>Change Photot:</label>
                    <input type="file" accept="image/*" name="image" onChange={handleImageChange} />
                  </p>
                  <p>
                    <label>Name:</label>
                    <input type="text" name="name" value={profile?.name} onChange={handleInputChange} />
                  </p>
                  <p>
                    <label>Email:</label>
                    <input type="email" name="email" value={profile?.email} onChange={handleInputChange} disabled />
                  </p>
                  <p>
                    <label>Phone:</label>
                    <input type="text" name="phone" value={profile?.phone} onChange={handleInputChange} />
                  </p>
                  <p>
                    <label>Bio:</label>
                    <textarea name="bio" cols="30" rows="10" value={profile?.bio} onChange={handleInputChange}></textarea>
                  </p>
                  <button className="--btn --btn-primary --btn-block">Update Profile</button>
                </form>
              </>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

export default Profile;