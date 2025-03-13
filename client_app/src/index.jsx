import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './components/UnauthorizedPage';
// import App from './App';
import { initializeApp } from './app/init';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
import ResetPasswordResult from './Login/ResetPasswordResult';
import LandingPage from './Landing/LandingPage';

initializeApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastContainer />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        <Route path="/user-selection/" element={<UserSelection />} />
        <Route path="/account-creation/" element={<AccountCreation />} />
        <Route path="/sign-up-confirmation/" element={<SignUpConfirmation />} />

        {/* Protected Routes */}
        <Route
          path="/student/*"
          element={<ProtectedRoute element={<StudentDashboard />} allowedRoles={['trainee']} />}
        />
        <Route
          path="/coordinator/*"
          element={<ProtectedRoute element={<CoordinatorDashboard />} allowedRoles={['ojt-coordinator']} />}
        />
        <Route
          path="/dean/*"
          element={<ProtectedRoute element={<DeanDashboard />} allowedRoles={['dean']} />}
        />
        <Route
          path="/admin/*"
          element={<ProtectedRoute element={<AdminHome />} allowedRoles={['admin']} />}
        />
        <Route
          path="/HTE/*"
          element={<ProtectedRoute element={<HTEDashboard />} allowedRoles={['hte-supervisor']} />}
        />

        {/* Public Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* <Route path="/reset-password/:token" /> */}

        <Route path="/reset-confirmation" element={<ResetConfirmation />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/password-changed-success" element={<PasswordChangedSuccess />} />
        <Route path="/verify-email/:token" element={<AccountVerification />} />
        <Route path="/reset-password/:token" element={<ResetPasswordResult />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
