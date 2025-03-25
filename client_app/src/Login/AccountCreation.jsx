import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

import InputText from './../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { mdiEye, mdiEyeOff } from '@mdi/js';

function AccountCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType } = location.state || { userType: 'student' };
  console.log("User Type:", userType);

  const handleSignInClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/sign-up-confirmation');
  };


  const [fileName, setFileName] = useState("");
  const [companies, setCompanies] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('company/list/allCompanies/get');
      let result = response.data.data


      setCompanies(result);
      setIsLoaded(true)

    } catch (error) {
      console.error("Error fetching trainees:", error);
    }
  };


  const fetchColleges = async () => {
    try {
      const response = await axios.get('college/list');
      let result = response.data.data;

      // Set colleges directly since it's already in the correct format
      setColleges(result);

      // Get programs from first college by default
      if (result && result.length > 0) {
        setPrograms(result[0].programs);
      }

      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      toast.error("Failed to fetch colleges and programs");
    }
  };



  useEffect(() => {
    fetchCompanies();
    fetchColleges();
  }, []);

  const formikConfig = {
    initialValues: {
      firstName: "",
      middleInitial: "",
      lastName: "",
      email: "",
      studentId: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      proofOfIdentity: "",
      college: "cect",
      program: "ece",
      company: "1",
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required("First name is required")
        .max(50, "First name must be 50 characters or less"),
        middleInitial: Yup.string()
        .min(1, "Middle initial must be at least 1 character")
        .max(2, "Middle initial must be at most 2 characters"),
      lastName: Yup.string()
        .required("Last name is required")
        .max(50, "Last name must be 50 characters or less"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      studentId: userType === 'student' ? Yup.string().required("Student ID is required") : null,
      password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[!@#$%^&*()_+{}\[\]:;<>,.?/~\\-]/, "Password must contain at least one special character"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
      phoneNumber: Yup.string()
        .required("Phone number is required")
        .matches(
          /^[0-9]+$/,
          "Phone number must only contain numbers"
        )
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be 15 digits or less"),
      // proofOfIdentity: Yup.string().required("Proof of identity is required"),
      // proofOfIdentity: Yup.mixed()
      //   .required("Proof of identity is required")
      //   .test(
      //     "fileSize",
      //     "File size is too large",
      //     (value) => !value || (value && value.size <= 2 * 1024 * 1024) // 2 MB
      //   )
      //   .test(
      //     "fileType",
      //     "Unsupported file format",
      //     (value) =>
      //       !value ||
      //       (value &&
      //         ["image/jpeg", "image/png", "application/pdf"].includes(
      //           value.type
      //         ))
      //   ),
      // college: Yup.string().when("userType", {
      //   is: (userType) => userType !== "hte-supervisor",
      //   then: Yup.string().required("College is required"),
      // }),
      // program: Yup.string().when("userType", {
      //   is: (userType) =>
      //     userType !== "hte-supervisor" && userType !== "university-dean",
      //   then: Yup.string().required("Program is required"),
      // }),
      // company: Yup.string().when("userType", {
      //   is: "hte-supervisor",
      //   then: Yup.string().required("Company is required"),
      // }),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      // Object.entries(values).forEach(([key, value]) => {

      //   console.log({ key, value })
      //   formData.append(key, value);
      // });

      values.role = userType;
      console.log("FormData values:", values);



      try {
        let res = await axios({
          method: 'POST',
          url: 'user/create',
          data: values,
        });



        let insertedUserID = res.data.data.insertedUserID;


        const formData = new FormData();
        formData.append('userID', insertedUserID);


        formData.append('proofOfIdentity', values.proofOfIdentity); // Assuming values contains File objects
        await axios({
          // headers: {
          //   'content-type': 'multipart/form-data'
          // },
          method: 'POST',
          url: 'user/proof_of_identity/upload-files',
          data: formData
        });




        console.log({ insertedUserID })
        // Handle success (optional)
        toast.success('User created successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });

        window.location.href = '/sign-up-confirmation';

      } catch (error) {
        // Extract and display the error message
        const errorMessage =
          error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : 'An unknown error occurred.';

        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      }

    },
  };

  console.log({ companies })

  return isLoaded && (
    <Formik {...formikConfig}>
      {({
        handleSubmit,
        handleChange,
        handleBlur, // handler for onBlur event of form elements
        values,
        touched,
        errors,
        setFieldValue,
        isSubmitting
      }) => {

        console.log({ errors })
        return (
          <div className="account-creation-container relative overflow-hidden">
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
              
              <div className="account-creation-form max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <h2 className='text-center font-semibold text-2xl mb-6'>Let's set up your account</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                <div className="w-full">
                  <InputText
                    label="First Name"
                    labelColor="text-blue-950"
                    name="firstName"
                    type="text"
                    placeholder="First name"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && errors.firstName}
                  />
                </div>
                <div className="w-full">
                  <InputText
                    label="Middle Initial"
                    name="middleInitial"
                    type="text"
                    placeholder="Middle initial"
                    value={values.middleInitial}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.middleInitial && errors.middleInitial}
                  />
                </div>
                <div className="w-full">
                  <InputText
                    label="Last Name"
                    name="lastName"
                    type="text"
                    placeholder="Last name"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && errors.lastName}
                  />
                </div>
              </div>

              <div className="mb-2">
                <InputText
                  label={
                    userType === 'hte-supervisor'
                      ? 'Company Email'
                      : 'School / Institution Email'
                  }
                  name="email"
                  type="email"
                  placeholder={`Enter your ${userType === 'hte-supervisor' ? 'company' : 'school'
                    } email`}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && errors.email}
                />
              </div>

              {userType === 'student' && (
                <div className="mb-2">
                  <InputText
                    label="Student ID"
                    name="studentId"
                    type="text"
                    placeholder="Enter student ID"
                    value={values.studentId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.studentId && errors.studentId}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 mb-2">
                
              <div className="relative mt-2">
                <InputText
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"} // Toggle visibility
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                </button>
              </div>

              <div className="relative mt-2">
                <InputText
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"} // Toggle visibility
                  placeholder="Confirm your password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && errors.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                </button>
              </div>   
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 mb-2">
                <div className="">
                  <InputText
                    label="Phone Number"
                    name="phoneNumber"
                    type="text"
                    placeholder="Enter your phone number"
                    value={values.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phoneNumber && errors.phoneNumber}
                  />
                </div>
                <div className="">
                    <label className="text-gray-700 font-medium mb-2 block">Proof of Identity</label>
                    
                    <div className="flex items-center">
                      {/* Hide the actual file input */}
                      <input
                        id="proofOfIdentity"
                        name="proofOfIdentity"
                        type="file"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.currentTarget.files[0];
                          console.log({ file });
                          setFieldValue("proofOfIdentity", file);
                          
                          if (file) {
                            setFileName(file.name);
                          }
                        }}
                        onBlur={handleBlur}
                      />
                      
                      {/* Button styled like the phone field but smaller */}
                      <label 
                        htmlFor="proofOfIdentity" 
                        className="border-2 border-black rounded px-4 py-2 bg-white text-gray-600 cursor-pointer hover:bg-gray-50"
                      >
                        Choose File
                      </label>
                      
                      {/* Filename display with matching styling */}
                      <span className="ml-3 text-gray-800">
                        {fileName || "No file chosen"}
                      </span>
                    </div>
                    
                    {touched.proofOfIdentity && errors.proofOfIdentity && (
                      <div className="text-red-500 text-sm mt-1">{errors.proofOfIdentity}</div>
                    )}
                  </div>
              </div>
                    
              {userType !== 'hte-supervisor' && (
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="">
                    <label htmlFor="college" className='mb-2'>College</label>
                    <select
                      id="college"
                      className="form-control mb-2"
                      onChange={(e) => {
                        let value = e.target.value;
                        setFieldValue('college', value);

                        // Update programs when college changes
                        const selectedCollege = colleges.find(c => c.collegeID.toString() === value);
                        if (selectedCollege) {
                          setPrograms(selectedCollege.programs);
                          // Reset program selection
                          setFieldValue('program', '');
                        }
                      }}
                    >
                      <option value="">Select College</option>
                      {colleges.map((college) => (
                        <option key={college.collegeID} value={college.collegeID}>
                          {college.collegeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {userType !== 'dean' && (
                    <div className="">
                      <label htmlFor="program" className='mb-2'>Program / Course</label>
                      <select
                        id="program"
                        className="form-control"
                        onChange={(e) => {
                          let value = e.target.value;
                          setFieldValue('program', value);
                        }}
                      >
                        <option value="">Select Program</option>
                        {programs.map((program) => (
                          <option key={program.programID} value={program.programID}>
                            {program.programName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {userType === 'hte-supervisor' && (
                <div className="mt-2">
                  <label htmlFor="company" className='mb-2'>Company</label>
                  <select
                    id="company"
                    className="form-control"
                    onChange={(e) => {
                      let value = e.target.value;
                      setFieldValue("company", value);
                    }}
                  >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                      <option key={company.companyID} value={company.companyID}>
                        {company.companyName}
                      </option>
                    ))}
                  </select>

                </div>
              )}

              <button
                className={`submit-button flex items-center justify-center gap-2 ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  } text-white px-4 py-2 rounded`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Sign Up"}
              </button>

              <p className="sign-in-text">
                Already have an account?{' '}
                <span onClick={handleSignInClick} className="link-style">
                  Sign in
                </span>
              </p>
            </div>
            <ToastContainer />
          </div>
        );
      }}

    </Formik>
  );

};

export default AccountCreation;
