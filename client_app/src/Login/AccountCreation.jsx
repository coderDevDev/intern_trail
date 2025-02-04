import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css'; // Adjust the import path if necessary

import InputText from './../components/Input/InputText';
import { Formik, useField, useFormik, Form } from 'formik';
import * as Yup from 'yup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
function AccountCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType } = location.state || { userType: 'student' };

  const handleSignInClick = () => {
    navigate('/');
  };

  const handleSignUpClick = () => {
    navigate('/sign-up-confirmation');
  };



  const [companies, setCompanies] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('company/list');
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
      let result = response.data.data


      setColleges(result.colleges);
      setPrograms(result.programs)
      setIsLoaded(true)

    } catch (error) {
      console.error("Error fetching trainees:", error);
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
      middleInitial: Yup.string().max(1, "Middle initial must be 1 character"),
      lastName: Yup.string()
        .required("Last name is required")
        .max(50, "Last name must be 50 characters or less"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      studentId: userType === 'student' ? Yup.string().required("Student ID is required") : null,

      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
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
          <div className="account-creation-container">
            <div className="account-creation-form">
              <h2 className='text-center text-2xl'>Let's set up your account</h2>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="">
                  <InputText
                    label="First Name"
                    labelColor="text-blue-950"
                    name="firstName"
                    type="text"
                    placeholder=""
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && errors.firstName}
                  />
                </div>
                <div className="">
                  <InputText
                    label="Middle Initial"
                    name="middleInitial"
                    type="text"
                    placeholder="Enter your middle initial"
                    value={values.middleInitial}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.middleInitial && errors.middleInitial}
                  />
                </div>
                <div className="">
                  <InputText
                    label="Last Name"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && errors.lastName}
                  />
                </div>
              </div>

              <div className="">
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
                <div className="">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <InputText
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && errors.password}
                  />
                </div>
                <div>
                  <InputText
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && errors.confirmPassword}
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <InputText
                    value=""
                    label="Proof of Identity"
                    name="proofOfIdentity"
                    type="file"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];

                      console.log({ file })
                      setFieldValue("proofOfIdentity", file); // Update Formik state with the selected file
                    }}
                    onBlur={handleBlur}
                    error={touched.proofOfIdentity && errors.proofOfIdentity}
                  />
                </div>
              </div>

              {userType !== 'hte-supervisor' && (
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="">
                    <label htmlFor="college">College</label>
                    <select id="college" className="form-control"
                      onChange={(e) => {

                        let value = e.target.value;


                        setFieldValue('college', value);

                      }}
                    >


                      {colleges.map((company) => (
                        <option key={company.collegeID} value={company.collegeID}>
                          {company.collegeName}
                        </option>
                      ))}

                    </select>
                  </div>
                  {userType !== 'university-dean' && (
                    <div className="">
                      <label htmlFor="program">Program / Course</label>
                      <select id="program" className="form-control"

                        onChange={(e) => {

                          let value = e.target.value;


                          setFieldValue('program', value);

                        }}
                      >
                        {programs.map((company) => (
                          <option key={company.programID} value={company.programID}>
                            {company.progName}
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
                {/* {isSubmitting && (
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )} */}
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
