import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

function EmailVerified() {

    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="confirmation-container relative overflow-hidden">
            <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
            >
            <div
                style={{
                clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="relative left-[calc(50%)] aspect-[1155/678] w-[48rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:w-[96rem]"
            />
            </div>

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
