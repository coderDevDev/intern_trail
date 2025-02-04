import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Main Dashboards
import StudentDashboard from './Student/StudentDashboard';
import CoordinatorDashboard from './Coordinator/CoordinatorDashboard';
import DeanDashboard from './Dean/DeanDashboard';
import AdminHome from './Admin/AdminHome';
import HTEDashboard from './HTE/HteDashboard';

// Login Components
import Login from './Login/Login';
import UserSelection from './Login/UserSelection';
import AccountCreation from './Login/AccountCreation';
import SignUpConfirmation from './Login/SignUpConfirmation';
import AccountVerification from './Login/AccountVerification';

import ForgotPassword from './Login/ForgotPassword';
import ResetConfirmation from './Login/ResetConfirmation';
import ChangePassword from './Login/ChangePassword';
import EmailVerified from './Login/EmailVerified';
import PasswordChangedSuccess from './Login/PasswordChangedSuccess'; // Import the PasswordChangedSuccess component

import initializeApp from './app/init';

initializeApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/user-selection/" element={<UserSelection />} />
        <Route path="/account-creation/" element={<AccountCreation />} />
        <Route path="/sign-up-confirmation/" element={<SignUpConfirmation />} />
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="/coordinator/*" element={<CoordinatorDashboard />} />
        <Route path="/dean/*" element={<DeanDashboard />} />
        <Route path="/admin/*" element={<AdminHome />} />
        <Route path="/HTE/*" element={<HTEDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-confirmation" element={<ResetConfirmation />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="/password-changed-success"
          element={<PasswordChangedSuccess />}
        />
        <Route path="/verify-email/:token" element={<AccountVerification />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
