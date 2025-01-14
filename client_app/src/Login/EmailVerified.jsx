import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

function EmailVerified() {

    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/');
    };

    return (
        <div className="confirmation-container">
            <div className="confirmation-message">
                <h2>Your email has been successfully verified</h2>
                <p>Wait for your account to be approved.</p> 
                <p>
                    Or proceed to{' '}
                    <span onClick={handleLoginClick} className="link-style">login</span>
                </p>         
            </div>
        </div>
    );
}

export default EmailVerified;
