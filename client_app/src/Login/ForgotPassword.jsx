// src/Login/ForgotPassword.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary
import { mdiAccount, mdiLockOutline, mdiEye, mdiEyeOff } from '@mdi/js';


import InputText from './../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
function ForgotPassword() {


  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle forgot password logic here, e.g., send a reset link to the user's email
    console.log(`Reset link sent to: ${email}`);
    navigate('/reset-confirmation'); // Redirect to ResetConfirmation page after successful submission
  };

  const handleBackToLoginClick = () => {
    navigate('/'); // Redirect to login page
  };


  const formikConfig = {
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required('Required field'),
    }),
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {
      try {
        setSubmitting(true);
        let res = await axios({
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


        setSubmitting(false);
      } catch (error) {

        // console.log(error.response.data.message)
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
      }

      // setErrorMessage('');
      // localStorage.setItem('token', 'DumyTokenHere');
      // setLoading(false);
      // window.location.href = '/app/dashboard';
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
            handleBlur, // handler for onBlur event of form elements
            values,
            touched,
            errors,
            isSubmitting
          }) => {

            return <Form>

              <div className="">

                <InputText
                  // icons={mdiAccount}
                  label="Email"
                  labelColor="text-blue-950"
                  name="email"
                  type="text"
                  placeholder=""
                  value={values.email}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />
              </div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="submit-button">Send Reset Link</button>
              <p className="sign-in-text">
                Proceed to{' '}
                <span onClick={handleBackToLoginClick} className="link-style">login</span>
              </p>

            </Form>

          }}
        </Formik>
        <ToastContainer />
      </div>
    </div>
  );
}

export default ForgotPassword;
