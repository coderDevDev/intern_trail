// src/Login/ForgotPassword.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary
import InputText from './../components/Input/InputText';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

function ForgotPassword() {
  const navigate = useNavigate();

  const formikConfig = {
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required('Required field'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        await axios({
          method: 'POST',
          url: 'auth/forgotPassword',
          data: values
        });

        toast.success(`Sent successfully`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });

        navigate('/reset-confirmation');
      } catch (error) {
        toast.error(`Login Failed. Unknown User.`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2>Enter your Email</h2>

        <Formik {...formikConfig}>
          {({
            handleSubmit,
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
            isSubmitting
          }) => (
            <Form>
              <div className="">
                <InputText
                  label="Email"
                  labelColor="text-blue-950"
                  name="email"
                  type="text"
                  placeholder=""
                  value={values.email}
                  onBlur={handleBlur}
                />
              </div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="submit-button flex items-center justify-center"
              >
                {isSubmitting ?

                  <div className="flex items-center justify-center">
                    <Spinner />
                  </div>



                  : "Send Reset Link"}
              </button>
              <p className="sign-in-text">
                Proceed to{' '}
                <span onClick={() => navigate('/')} className="link-style">login</span>
              </p>
            </Form>
          )}
        </Formik>
        <ToastContainer />
      </div>
    </div>
  );
}

export default ForgotPassword;
