import React from 'react';
import { useDispatch } from 'react-redux';

import "./Notification.scss";
import { RESET, sendVerificationEmail } from '../../redux/features/auth/authSlice';

const Notification = () => {
    const dispatch = useDispatch();

    const resendVerificationEmail = async () => {
        await dispatch(sendVerificationEmail());
        await dispatch(RESET());
    }
    
  return (
    <div className="container">
        <div className="alert">
            <p>
                <b>Message:</b> &nbsp;
            </p>
            <p>
                To verify your account, check your email for a Verification link. &nbsp;
            </p>
            <p className="v-link" onClick={resendVerificationEmail}>
                <b>Resend Link</b>
            </p>
        </div>
    </div>
  )
}

export default Notification;