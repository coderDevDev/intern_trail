import React from 'react';
import { useState, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary
import { ArrowLeft } from 'lucide-react'; 


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
      setLoading(true); // Set loading to true when form is submitted
      
      try {
        let res = await axios({
          method: 'POST',
          url: 'auth/login',
          data: values
        });

        let { token } = res.data;
        let user = res.data.data;

        console.log({ user })

        localStorage.setItem('token', token);
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        // Update axios default headers immediately after storing the token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Use navigate instead of window.location
        const roleRoutes = {
          'trainee': '/student/home',
          'ojt-coordinator': '/coordinator/home',
          'hte-supervisor': '/HTE/home',
          'dean': '/dean/home',
          'admin': '/admin/dashboard'
        };

        navigate(roleRoutes[user.role]);
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
      } finally {
        setLoading(false); // Set loading back to false regardless of success or error
      }

      // setErrorMessage('');
      // localStorage.setItem('token', 'DumyTokenHere');
      // setLoading(false);
      // window.location.href = '/app/dashboard';
    }
  };

  return (

    <div className="login-container relative overflow-hidden">
      {/* Background gradient - modify positioning or colors as needed */}
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
      

      <div className="login-form ">
        <img src="/logo.png" alt="logo" className="mx-auto block my-8 w-50 h-auto" />
        <h1 className='text-2xl font-semibold text-center mb-4'>
          Log in
        </h1>
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
                  placeholder="Enter your email"
                  value={values.email}
                  onBlur={handleBlur} // This apparently updates `touched`?
                />

                <div className="relative">
                  <InputText
                    // icons={mdiLockOutline}
                    labelColor="text-blue-950"
                    label="Password"
                    name="password"
                    placeholder="Enter your password"
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
                      <svg className="w-10 h-5 mt-4 pt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d={mdiEyeOff} />
                      </svg>
                    ) : (
                      <svg className="w-10 h-5 mt-4 pt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d={mdiEye} />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="flex justify-between items-center text-blue-950">
                  <button
                    onClick={(e) => {
                      if (e.detail === 0) return; // Ignore keyboard events
                      e.preventDefault();
                      window.location.href = '/';
                    }}
                    className="flex items-center text-black-950 text-sm hover:text-buttonPrimary hover:underline transition duration-200 focus:outline-none"
                  >
                    <ArrowLeft size={14} className="mr-1" />
                    <span>Back</span>
                  </button>

                  
                  <a href="/forgot-password">
                    <span className="text-sm text-blue-950 inline-block hover:text-buttonPrimary hover:underline hover:cursor-pointer transition duration-200">
                      Forgot Password?
                    </span>
                  </a>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                <button className="register-button" onClick={handleRegisterClick}>Create an Account</button>
              </Form>
            );
          }}
        </Formik>

        <ToastContainer />
        {/* <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" className="form-control" placeholder="Enter your email" />
        </div>h
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