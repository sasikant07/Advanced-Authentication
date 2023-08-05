import React, {useState} from 'react';
import {AiOutlineMail} from "react-icons/ai";
import {Link} from "react-router-dom";
import styles from "./auth.module.scss";
import Card from '../../components/card/Card';

const Forgot = () => {
    const [email, setEmail] = useState("");
    
    const handleInputChange = (e) => {
        
    }

    const loginUser = (e) => {

    }

  return (
    <div className={`container ${styles.auth}`}>
        <Card>
            <div className={styles.form}>
                <div className="--flex-center">
                    <AiOutlineMail size={35} color="#999" />
                </div>
                <h2>Forgot Password</h2>

                <form onSubmit={loginUser}>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={handleInputChange} 
                        required />

                    <button type="submit" className="--btn --btn-primary --btn-block">Get Reset Email</button>
                    <div className={styles.links}>
                        <p><Link to="/">- Home</Link></p>
                        <p><Link to="/login">- Login</Link></p>
                    </div>
                </form>
            </div>
        </Card>
    </div>
  )
}

export default Forgot;