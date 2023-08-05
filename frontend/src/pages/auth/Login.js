import React, {useState} from 'react';
import {BiLogIn} from "react-icons/bi";
import {Link} from "react-router-dom";
import styles from "./auth.module.scss";
import Card from '../../components/card/Card';
import PasswordInput from '../../components/passwordInput/PasswordInput';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleInputChange = (e) => {
        
    }

    const loginUser = (e) => {

    }

  return (
    <div className={`container ${styles.auth}`}>
        <Card>
            <div className={styles.form}>
                <div className="--flex-center">
                    <BiLogIn size={35} color="#999" />
                </div>
                <h2>Login</h2>
                <div className="--flex-center">
                    <buttton className="--btn --btn-google">Login With Google</buttton>
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