import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import IconButton from '../../layout/ui/icon/iconButton';
import Image from '../../layout/ui/image/image';
import { Link } from "react-router-dom";
import "./login.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import appFirebase from "../../config/firebase";
import useFormInput from "../../hooks/useFormInput";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useEffect } from "react";
import LoadingScreen from "../../layout/ui/loading/loading";
import axios from "axios";

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  // const [email, setEmail] = React.useState('');
  // const [password, setPassword] = React.useState('');
  const email = useFormInput("");
  const password = useFormInput("");
  const auth = getAuth(appFirebase);
  const navigate = useNavigate();
  const [userObj, setUserObj] = useLocalStorage("user", null);
  const [loading, setLoading] = useLocalStorage(false);

  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (location.state?.toastMessage) {
      toast.error(location.state.toastMessage); // Show the toast message
    }
  }, [location.state]);

  const fetchEmployeeData = async (email) => {
    try {
      const response = await fetch(`${baseURL}/employee/user/email/${email}`, { // Replace with your API server URL
        headers: {
          'Content-Type': 'application/json'
        }
      });
      

      console.log('Response:', response);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Expected JSON, but received ${contentType}: ${text}`);
        throw new TypeError(`Expected JSON, but received ${contentType}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching employee data:", error);
      return null;
    }
  };

  const fetchAccessData = async (accessToken) => {
    try {
      const response = await axios.post(
        `${baseURL}/auth/createToken`,
        {}, // Passing refreshToken in body
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // const data = await response.json();
      console.log("fetchAccessData",response.data)
      return response.data;
    }catch (error) {
      console.error("Error fetching access data:", error);
      return null;
    }
  };

  const fetchRefreshData = async (refreshToken) => {
    try {
      const response = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken: refreshToken,
      });
      // const data = await response.json();
      console.log("fetchRefreshData",response.data)
      return response.data;
    }catch (error) {
      console.error("Error fetching refresh data:", error);
      return null;
    }
  };

  async function signInWEAP(event) {
    event.preventDefault();
    setLoading(true);
    const employeeData = await fetchEmployeeData(email.value);
    if (!employeeData) {
      
      setLoading(false);
      toast.error("Not authorized", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      
    }

    try {
      // Attempt to sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    
      // Toast notification for successful login
      toast.success("Logging In", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    
      // Extract user info
      const user = userCredential.user;
    
      // Fetch access data using user's accessToken
      const accessTokenData = await fetchAccessData(user.accessToken);

      
      const refreshTokenData = await fetchRefreshData(accessTokenData.refreshToken);
    
      // Prepare authentication object
      const authObj = {
        accessToken: refreshTokenData.accessToken,
        refreshToken: accessTokenData.refreshToken,
        email: user.email,
        uid: user.uid,
      };
    
      console.log("authObj",authObj);
      // Update state and navigate
      setUserObj(authObj);
      navigate("/");
    
    } catch (error) {
      // Handle errors and display error message via toast
      toast.error(error.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      // Ensure loading state is reset
      setLoading(false);
    }
    
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className=" rounded-lg flex items-center justify-center">
              <img src="/icon.png" className="w-15 h-10" />
              <div className="block sm:hidden xl:block ml-2 font-bold text-xl text-sidebar-text-color">
            NexaConnect
          </div>
            </div>
          </div>

          {/* Rest of the form remains exactly the same */}
          {/* Welcome Text */}
          {/* <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-600 mb-8">Please enter your credentials to sign in!</p> */}

          {/* Login Form */}
          <form onSubmit={signInWEAP}>
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                 type="email"
                 required="required"
                 name="email"
                 {...email}
                 placeholder="Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required="required"
                    name="password"
                    {...password}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <a href="/forgot" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-primary-button-color text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign In
              </button>

              {/* Social Login */}
              {/* <div>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <img
                      src="/api/placeholder/20/20"
                      alt="Google"
                      className="w-5 h-5 mr-2"
                    />
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <img
                      src="/api/placeholder/20/20"
                      alt="GitHub"
                      className="w-5 h-5 mr-2"
                    />
                    Github
                  </button>
                </div>
              </div> */}

              {/* Sign Up Link */}
              {/* <div className="text-center text-sm text-gray-600">
                Don't have an account yet?{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Sign up
                </a>
              </div> */}
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative Image */}
      <div className=" lg:flex flex-col flex-1 justify-between hidden rounded-3xl items-end relative  ml-auto mr-0">
        <div className="h-[calc(100vh-1px)] w-full relative">
          <div className="absolute inset-0">
            <div className="w-full h-full rounded-3xl overflow-hidden">
              <img 
                className="absolute h-full w-full top-0 left-0"
                src="/ECommerce.jpg"
                alt="Decorative background"
              />
            </div>
          </div>
        </div>
      </div>
     </div>
  );
};

export default Login;