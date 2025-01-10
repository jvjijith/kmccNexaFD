import { Link } from "react-router-dom";
import "./login.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import appFirebase from "../../config/firebase";
import useFormInput from "../../hooks/useFormInput";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useEffect, useState } from "react";
import LoadingScreen from "../../layout/ui/loading/loading";
import axios from "axios";
import "./login.css"; // Assuming CSS is placed in App.css

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const email = useFormInput("");
  const password = useFormInput("");
  const auth = getAuth(appFirebase);
  const navigate = useNavigate();
  const [userObj, setUserObj] = useLocalStorage("user", null);
  const [loading, setLoading] = useLocalStorage(false);

  const handleSignUp = () => setIsSignUp(true);
  const handleSignIn = () => setIsSignUp(false);

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
    <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          {/* Sign In Form */}
          <form onSubmit={signInWEAP} className="sign-in-form">
            <h2 className="title">Sign in</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input 
              type="email"
              required="required"
              name="email"
              {...email}
              placeholder="Email"/>
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
              type="password"
              required="required"
              name="password"
              {...password}
              placeholder="Password" />
            </div>
            <button type="submit" value="Login" className="btn solid" >
            Login
            </button>
           
          </form>

          {/* Sign Up Form */}
          {/* <form onSubmit={signInWEAP} className="sign-up-form">
            <h2 className="title">Sign up</h2>
            <div className="input-field">
              <i className="fas fa-user"></i>
              <input type="text" placeholder="Username" />
            </div>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input 
              type="email"
              required="required"
              name="email"
              {...email}
              placeholder="Email" />
            </div>
            <div className="input-field">
              <i className="fas fa-lock"></i>
              <input 
              type="password"
              required="required"
              name="password"
              {...password}
              placeholder="Password" />
            </div>
            <input type="submit" className="btn" value="Sign up" />
            <p className="social-text">Or Sign up with social platforms</p>
            <div className="social-media">
              <a href="#" className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-google"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </form> */}
        </div>
      </div>

      <div className="panels-container">
        {/* Left Panel */}
        <div className="panel left-panel">
          <div className="content">
            <h3>New to our community?</h3>
            <p>
              Discover a world of possibilities! Join us and explore a vibrant
              community where ideas flourish and connections thrive.
            </p>
            <button className="btn transparent">
              Sign up
            </button>
          </div>
          <img
            src="https://i.ibb.co/6HXL6q1/Privacy-policy-rafiki.png"
            className="image"
            alt="Sign Up"
          />
        </div>

        {/* Right Panel */}
        <div className="panel right-panel">
          <div className="content">
            <h3>One of Our Valued Members</h3>
            <p>
              Thank you for being part of our community. Your presence enriches
              our shared experiences. Let&apos;s continue this journey together!
            </p>
            <button className="btn transparent" onClick={handleSignIn}>
              Sign in
            </button>
          </div>
          <img
            src="https://i.ibb.co/nP8H853/Mobile-login-rafiki.png"
            className="image"
            alt="Sign In"
          />
        </div>
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default Login;
