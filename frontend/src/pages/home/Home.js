import React from 'react';
import { Link } from 'react-router-dom';
import "./Home.scss";
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import loginImg from "../../assets/login.svg";

const Home = () => {
  return (
    <div>
      <section className="container hero">
        <div className="hero-text">
          <h2>Ultimate MERN Stack Authentication System</h2>
          <p>Learn and Master Authentication and Authorization using MERN Stack.</p>
          <p>Implement User Registration, Login, Password Reset, Social Login, User Permissions, Email Notifications etc.</p>

          <div className="hero-buttons --flex-start">
            <button className="--btn --btn-danger">
              <Link to="/register">Register</Link>
            </button>
            <button className="--btn --btn-primary">
              <Link to="/login">Login</Link>
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src={loginImg} alt="Auth" />
        </div>
      </section>
    </div>
  )
}

export default Home;