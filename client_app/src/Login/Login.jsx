import React from 'react';
import { useState, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary


import InputText from './../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';
import { mdiAccount, mdiLockOutline, mdiEye, mdiEyeOff } from '@mdi/js';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/user-selection');
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };


  const INITIAL_LOGIN_OBJ = {
    password: '',
    emailId: ''
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);


  const [showPassword, setShowPassword] = useState(false); // State to manage password visibility

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };



  const formikConfig = {
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required('Required field'),
      password: Yup.string()
        .min(8, 'Minimun of 8 character(s)')
        .required('Required field')
    }),
    onSubmit: async (
      values,
      { setSubmitting, setFieldValue, setErrorMessage, setErrors }
    ) => {
      try {
        let res = await axios({
          method: 'POST',
          url: 'auth/login',
          data: values
        });

        let { token } = res.data;
        let user = res.data.data;

        console.log({ user })

        let role = user.role;

        if (role === 'trainee') {

          window.location.href = '/student';
        }

        else if (role === 'ojt-coordinator') {
          window.location.href = '/coordinator';

        }

        else if (role === 'hte-supervisor') {
          window.location.href = '/HTE';

        }

        else if (role === 'dean') {
          window.location.href = '/dean';

        }

        else if (role === 'admin') {
          window.location.href = '/admin';

        }


        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        // window.location.href = '/app/dashboard';
      } catch (error) {
        const errorMessage =
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'An unknown error occurred.';
        // console.log(error.response.data.message)
        toast.error(errorMessage, {
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
    <div className="login-container">
      <div className="login-form">
        <h2 className='text-center text-2xl text-blue-900 font-bold'>Welcome to InternTrail</h2>
        <Formik {...formikConfig}>
          {({
            handleSubmit,
            handleChange,
            handleBlur, // handler for onBlur event of form elements
            values,
            touched,
            errors
          }) => {
            return (
              <Form className="space-y-4 md:space-y-6">
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

                <div className="relative">
                  <InputText
                    // icons={mdiLockOutline}
                    labelColor="text-blue-950"
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"} // Change type based on visibility
                    value={values.password}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center" // Added z-10
                  >
                    {showPassword ? (
                      <svg className="w-10 h-5 mt-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d={mdiEyeOff} />
                      </svg>
                    ) : (
                      <svg className="w-10 h-5 mt-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d={mdiEye} />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-right text-blue-950">
                  <a href="/forgot-password"><span className="text-sm  text-blue-950 inline-block  hover:text-buttonPrimary  hover:underline hover:cursor-pointer transition duration-200">Forgot Password?</span></a></div>

                <button
                  type="submit"
                  className="submit-button">
                  Sign in
                </button>

                <button className="register-button" onClick={handleRegisterClick}>Create an Account</button>
                {/* <div className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                      Don't have an account yet?
                      <Link to="/register">
                        <span className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                          Register
                        </span>
                      </Link>
                    </div> */}
              </Form>
            );
          }}
        </Formik>

        <ToastContainer />
        {/* <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" className="form-control" placeholder="Enter your email" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" className="form-control" placeholder="Enter your password" />
        </div>
        <div className="form-group">
          <span onClick={handleForgotPasswordClick} className="link-style">Forgot password?</span>
        </div> */}
        {/* <button className="submit-button">Sign in</button> */}

      </div>
    </div>
  );
};

export default Login;
