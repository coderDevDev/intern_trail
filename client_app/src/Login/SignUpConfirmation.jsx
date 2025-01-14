import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

function SignUpConfirmation() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/');
    };

    return (
        <div className="confirmation-container">
            <div className="confirmation-message">
                <h2>Account Successfully Registered</h2>
                <p>Please check your email for verification and wait for your account to be approved.</p>
                <p>
                    Proceed to{' '}
                    <span onClick={handleLoginClick} className="link-style">login</span>
                </p>             
            </div>
        </div>
    );
};

export default SignUpConfirmation;
