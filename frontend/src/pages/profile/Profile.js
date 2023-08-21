import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import Card from '../../components/card/Card';
import profileImg from "../../assets/avatar.png";
import "./Profile.scss";
import Pagemenu from '../../components/pageMenu/Pagemenu';
import useRedirectLoggedOutUser from '../../customHook/useRedirectLoggedOutUser';
import { getUser, selectUser, updateUser } from '../../redux/features/auth/authSlice';
import Loader from '../../components/loader/Loader';
import { toast } from 'react-toastify';
import Notification from '../../components/notification/Notification';

const cloud_name = process.env.RAECT_APP_CLOUD_NAME;
const upload_preset = process.env.RAECT_APP_UPLOAD_PRESET;

const shortenText = (text, n) => {
  if (text.length > n) {
    const shortenedText = text.substring(0, n).concat("...");

    return shortenedText;
  }

  return text;
}

const Profile = () => {
  useRedirectLoggedOutUser("/login");
  const {isLoading, isLoggedIn, isSuccess, message, user} = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const initialState = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    photo: user?.photo || "",
    role: user?.role || "",
    isVerified:  user?.isVerified || false,
  }

  const [profile, setProfile] = useState(initialState);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
    setImagePreview(URL.createObjectURL(e.target.files[0]));
  }

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setProfile({ ...profile, [name]: value });
  }

  const saveProfile = async (e) => {
    e.preventDefault();

    let imageURL;

    try {
      if (profileImage !== null && (profileImage.type === "image/jpeg" || profileImage.type === "image/jpg" || profileImage.type === "image/png")) {
        const image = new FormData();
        image.append("file", profileImage);
        image.append("cloud_name", cloud_name);
        image.append("upload_preset", upload_preset);

        // Save image to Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,{method: "post", body: image});
        const imgData = await response.json();
        imageURL = imgData.url.toString();
      }

      // Save profile to MongoDB
      const userData = {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        photo: profileImage ? imageURL : profile.photo,
      }

      dispatch(updateUser(userData));

    } catch (error) {
      toast.error(error.message);
    }
  }

  useLayoutEffect(() => {
    if (user) {
      setProfile({
        ...profile, 
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,
        bio: user.bio,
        role: user.role,
        isVerified: user.isVerified,
      });
    }
  }, [user])

  return (
    <>
      {isLoading && <Loader />}
      {!profile.isVerified && <Notification />}
      <section>
        <div className="container">
          <Pagemenu />
          <h2>Profile</h2>
          <div className="--flex-start profile">
            <Card cardClass={"card"}>
              {!isLoading && user && (
                <>
                  <div className="profile-photo">
                    <div>
                      <img src={imagePreview === null ? user?.photo : imagePreview} alt="Profileimg" />
                      <h3>Role: {profile.role}</h3>
                    </div>
                  </div>
                  <form onSubmit={saveProfile}>
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
              )}
              
            </Card>
          </div>
        </div>
      </section>
    </>
  )
};

export const UserName = () => {
  const user = useSelector(selectUser);

  const username = user?.name || "...";

  return <p className="--color-white">Hi, {shortenText(username, 10)} | </p>
}

export default Profile;