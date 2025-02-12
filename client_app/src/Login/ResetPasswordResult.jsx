import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import InputText from './../components/Input/InputText';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function ResetPasswordResult() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [resetStatus, setResetStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetPassword = async (newPassword) => {
    try {
      const response = await axios.post(`/auth/reset-password/${token}`, {
        newPassword
      });

      if (response.data.success) {
        setResetStatus('success');
      } else {
        setResetStatus('failed');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setResetStatus('failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {resetStatus === 'success' ? (
          <>
            <h1 className="text-4xl font-bold text-green-600 mb-4">Success</h1>
            <p className="text-gray-600 mb-6">Your password has been reset successfully.</p>
          </>
        ) : resetStatus === 'failed' ? (
          <>
            <h1 className="text-4xl font-bold text-red-600 mb-4">Failed</h1>
            <p className="text-gray-600 mb-6">There was an error resetting your password. Please try again.</p>
          </>
        ) : (
          <Formik
            initialValues={{ newPassword: '', confirmPassword: '' }}
            validationSchema={Yup.object({
              newPassword: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Required'),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                .required('Required')
            })}
            onSubmit={(values, { setSubmitting }) => {
              resetPassword(values.newPassword);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="relative">
                  <InputText
                    label="New Password"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute mt-4 inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative mt-4">
                  <InputText
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute mt-4 inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Reset Password'}
                </button>
              </Form>
            )}
          </Formik>
        )}
        {/* <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button> */}
      </div>
    </div>
  );
}

export default ResetPasswordResult; 