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
    <div className="forgot-password-container relative overflow-hidden">
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
                <span onClick={() => navigate('/login')} className="link-style">login</span>
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
