import React, {useState, useEffect} from 'react';
import {BiLogIn} from "react-icons/bi";
import {Link, useNavigate} from "react-router-dom";
import { toast } from 'react-toastify';
import {useSelector, useDispatch} from "react-redux";
import { GoogleLogin } from '@react-oauth/google';

import styles from "./auth.module.scss";
import Card from '../../components/card/Card';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import { validateEmail } from '../../redux/features/auth/authService';
import { RESET, login, loginWithGoogle, sendLoginCode } from '../../redux/features/auth/authSlice';
import Loader from '../../components/loader/Loader';

const initialState = {
    email: "",
    password: "",
}

const Login = () => {
    const [formData, setFormData] = useState(initialState);
    const {email, password} = formData;
    const {isLoading, isLoggedIn, isSuccess, message, isError, twoFactor} = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const loginUser = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            return toast.error("All fields are required");
        }

        if (!validateEmail(email)) {
            return toast.error("Please enter a valid email");
        }

        const userData = { email, password };

        await dispatch(login(userData));
    }

    useEffect(() => {
        if (isSuccess && isLoggedIn) {
            navigate("/profile");
        }

        if (isError && twoFactor) {
            dispatch(sendLoginCode(email));
            navigate(`/loginWithCode/${email}`);
        }

        dispatch(RESET());
    }, [isLoggedIn, isSuccess, dispatch, navigate, isError, twoFactor, email]);

    const googleLogin = async (credentialResponse) => {
        await dispatch(loginWithGoogle({userToken: credentialResponse.credential}));
    }

  return (
    <div className={`container ${styles.auth}`}>
        {isLoading && <Loader />}
        <Card>
            <div className={styles.form}>
                <div className="--flex-center">
                    <BiLogIn size={35} color="#999" />
                </div>
                <h2>Login</h2>
                <div className="--flex-center">
                    {/* <button className="--btn --btn-google">Login With Google</button> */}
                    <GoogleLogin
                        onSuccess={googleLogin}
                        onError={() => {
                            console.log('Login Failed');
                            toast.error("Login Failed");
                        }}
                    />
                </div>
                <br />
                <p className="--text-center --fw-bold">or</p>

                <form onSubmit={loginUser}>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={handleInputChange} 
                        required />
                    {/* <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={handleInputChange} 
                        required /> */}
                    <PasswordInput 
                        name="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={handleInputChange}
                    />

                        <button type="submit" className="--btn --btn-primary --btn-block">Login</button>
                </form>
                <Link to="/forgot">Forgot Password</Link>
                <span className={styles.register}>
                    <Link to="/">Home</Link>
                    <p>&nbsp; Don't have an account? &nbsp;</p>
                    <Link to="/register">Register</Link>
                </span>
            </div>
        </Card>
    </div>
  )
}

export default Login;