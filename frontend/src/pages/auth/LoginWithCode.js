import React, {useState, useEffect} from 'react';
import {GrInsecure} from "react-icons/gr";
import {Link, useNavigate, useParams} from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from "./auth.module.scss";
import Card from '../../components/card/Card';
import { RESET, loginWithCode, sendLoginCode } from '../../redux/features/auth/authSlice';
import Loader from '../../components/loader/Loader';

const LoginWithCode = () => {
    const [loginCode, setLoginCode] = useState("");
    const {email} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {isLoading, isLoggedIn, isSuccess} = useSelector((state) => state.auth);
    
    const handleInputChange = (e) => {
        setLoginCode(e.target.value);
    }

    const handleLoginUserWithCode = async (e) => {
        e.preventDefault();

        if (loginCode === "") {
            return toast.error("Please fill in the login code");
        }

        if (loginCode.length !== 6) {
            return toast.error("Incorrect code");
        }

        const code = {
            loginCode
        }

        await dispatch(loginWithCode({code, email}));
    }

    const sendUserLoginCode = async () => {
        await dispatch(sendLoginCode(email));
        await dispatch(RESET());
    }

    useEffect(() => {
        if (isSuccess && isLoggedIn) {
            navigate("/profile");
        }

        dispatch(RESET());
    }, [isLoggedIn, isSuccess, dispatch, navigate]);

  return (
    <div className={`container ${styles.auth}`}>
        {isLoading && <Loader />}
        <Card>
            <div className={styles.form}>
                <div className="--flex-center">
                    <GrInsecure size={35} color="#999" />
                </div>
                <h2>Enter Access Code</h2>

                <form onSubmit={handleLoginUserWithCode}>
                    <input 
                        type="text" 
                        name="loginCode" 
                        placeholder="Access Code" 
                        value={loginCode} 
                        onChange={handleInputChange} 
                        required />

                    <button type="submit" className="--btn --btn-primary --btn-block">Proceed To Login</button>
                    <span className="--flex-center">Check your email for login access code</span>
                    <div className={styles.links}>
                        <p><Link to="/">- Home</Link></p>
                        <p className="v-link --color-primary" onClick={sendUserLoginCode}><b>Resent Code</b></p>
                    </div>
                </form>
            </div>
        </Card>
    </div>
  )
}

export default LoginWithCode;