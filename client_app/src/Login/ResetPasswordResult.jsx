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
    <div className="flex items-center justify-center min-h-screen bg-none">
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
              .required("Password is required")
              .min(8, "Password must be at least 8 characters")
              .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
              .matches(/[0-9]/, "Password must contain at least one number")
              .matches(/[!@#$%^&*()_+{}\[\]:;<>,.?/~\\-]/, "Password must contain at least one special character"),
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