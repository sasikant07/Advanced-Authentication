import React, {useEffect, useState} from 'react';
import {TiUserAddOutline} from "react-icons/ti";
import {FaTimes} from "react-icons/fa";
import {BsCheck2All} from "react-icons/bs";
import {Link} from "react-router-dom";
import styles from "./auth.module.scss";
import Card from '../../components/card/Card';
import PasswordInput from '../../components/passwordInput/PasswordInput';
import { toast } from 'react-toastify';
import { validateEmail } from '../../redux/features/auth/authService';

const initialState = {
    name: "",
    email: "",
    password: "",
    password2: "",
}

const Register = () => {
    const [formData, setFormData] = useState(initialState);
    const {name, email, password, password2} = formData;

    const [uCase, setUCase] = useState(false);
    const [num, setNum] = useState(false);
    const [sChar, setSChar] = useState(false);
    const [passLength, setPassLength] = useState(false);

    const timesIcon = <FaTimes color="red" size={15} />
    const checkIcon = <BsCheck2All color="green" size={15} />

    const switchIcon = (condition) => {
        if (condition) {
            return checkIcon;
        }
        return timesIcon;
    }

    
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({ ...formData, [name]: value });
    }

    useEffect(() => {
        // Check Lower and Uppercase
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
            setUCase(true);
        } else {
            setUCase(false);
        }

        // Check for numbers
        if (password.match(/([0-9])/)) {
            setNum(true);
        } else {
            setNum(false);
        }

        // Check For Special char
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
            setSChar(true);
        } else {
            setSChar(false);
        }

        // Check Password Length
        if (password.length > 5) {
            setPassLength(true);
        } else {
            setPassLength(false);
        }
    }, [password])

    const registerUser = (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            return toast.error("All fields are required");
        }

        if (password.length < 6) {
            return toast.error("Password must be upto 6 char");
        }

        if (!validateEmail(email)) {
            return toast.error("Please enter a valid email");
        }

        if (password !== password2) {
            return toast.error("Passwords doesn't match");
        }

        const userData = { name, email, password };

        console.log(userData);
    }

  return (
    <div className={`container ${styles.auth}`}>
        <Card>
            <div className={styles.form}>
                <div className="--flex-center">
                    <TiUserAddOutline size={35} color="#999" />
                </div>
                <h2>Register</h2>

                <form onSubmit={registerUser}>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        value={name} 
                        onChange={handleInputChange} 
                        required />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={handleInputChange} 
                        required />
                    <PasswordInput 
                        name="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={handleInputChange}
                    />
                    <PasswordInput 
                        name="password2" 
                        placeholder="Confirm Password" 
                        value={password2} 
                        onChange={handleInputChange}
                        onPaste={(e) => {
                            e.preventDefault();
                            toast.error("cannot paste into unput field");
                            return false;
                        }}
                    />

                    {/* Password Strength */}
                    <Card cardClass={styles.group}>
                        <ul className="form-list">
                            <li>
                                <span className={styles.indicator}>
                                    {switchIcon(uCase)}
                                        &nbsp;
                                    Lowercase & Uppercase
                                </span>
                            </li>
                            <li>
                                <span className={styles.indicator}>
                                    {switchIcon(num)}
                                        &nbsp;
                                    Number (0-9)
                                </span>
                            </li>
                            <li>
                                <span className={styles.indicator}>
                                    {switchIcon(sChar)}
                                        &nbsp;
                                    Special Character (!@#$%^&*)
                                </span>
                            </li>
                            <li>
                                <span className={styles.indicator}>
                                    {switchIcon(passLength)}
                                        &nbsp;
                                    At least 6 Character
                                </span>
                            </li>
                        </ul>
                    </Card>

                    <button type="submit" className="--btn --btn-primary --btn-block">Register</button>
                </form>
                <span className={styles.register}>
                    <Link to="/">Home</Link>
                    <p>&nbsp; Already have an account? &nbsp;</p>
                    <Link to="/login">Login</Link>
                </span>
            </div>
        </Card>
    </div>
  )
}

export default Register;