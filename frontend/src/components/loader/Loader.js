import React from 'react';
import "./Loader.scss";
import ReactDOM from 'react-dom';
import loaderimg from "../../assets/loader.gif";

const Loader = () => {
    // Creating Portal
  return ReactDOM.createPortal(
    <div className="wrapper">
        <div className="loader">
            <img src={loaderimg} alt="Loading..." />
        </div>
    </div>,
    document.getElementById("loader")
  )
}

export const Spinner = () => {
    return (
        <div className="--center-all">
            <img src={loaderimg} alt="Loading..." />
        </div>
    )
}

export default Loader;