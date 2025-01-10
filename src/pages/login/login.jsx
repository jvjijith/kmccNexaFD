import { Link } from "react-router-dom";
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
import "./loginScreen.css"; // Assuming CSS is placed in App.css

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
      const response = await fetch(`${baseURL}/employee/user/email/${email}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
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
        {},
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching access data:", error);
      return null;
    }
  };

  const fetchRefreshData = async (refreshToken) => {
    try {
      const response = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken: refreshToken,
      });
      return response.data;
    } catch (error) {
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
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
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

      const user = userCredential.user;
      const accessTokenData = await fetchAccessData(user.accessToken);
      const refreshTokenData = await fetchRefreshData(accessTokenData.refreshToken);

      const authObj = {
        accessToken: refreshTokenData.accessToken,
        refreshToken: accessTokenData.refreshToken,
        email: user.email,
        uid: user.uid,
      };

      setUserObj(authObj);
      navigate("/");
    } catch (error) {
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
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`login-container ${isSignUp ? "sign-up-mode" : ""}`}>
      <div className="login-forms-container">
        <div className="login-signin-signup">
          <form onSubmit={signInWEAP} className="login-form login-sign-in-form">
            <h2 className="login-title">Sign in</h2>
            <div className="login-input-field">
              <i className="fas fa-user"></i>
              <input 
                type="email"
                required="required"
                name="email"
                {...email}
                placeholder="Email"/>
            </div>
            <div className="login-input-field">
              <i className="fas fa-lock"></i>
              <input 
                type="password"
                required="required"
                name="password"
                {...password}
                placeholder="Password" />
            </div>
            <button type="submit" value="Login" className="login-btn solid">
              Login
            </button>
          </form>
        </div>
      </div>

      <div className="login-panels-container">
        <div className="login-panel login-left-panel">
          <div className="content">
            <h3>New to our community?</h3>
            <p>
              Discover a world of possibilities! Join us and explore a vibrant
              community where ideas flourish and connections thrive.
            </p>
            <button className="login-btn transparent">
              Sign up
            </button>
          </div>
          <img
            src="https://i.ibb.co/6HXL6q1/Privacy-policy-rafiki.png"
            className="login-image"
            alt="Sign Up"
          />
        </div>

        {/* <div className="login-panel login-right-panel">
          <div className="content">
            <h3>One of Our Valued Members</h3>
            <p>
              Thank you for being part of our community. Your presence enriches
              our shared experiences. Let&apos;s continue this journey together!
            </p>
            <button className="login-btn transparent" onClick={handleSignIn}>
              Sign in
            </button>
          </div>
          <img
            src="https://i.ibb.co/nP8H853/Mobile-login-rafiki.png"
            className="login-image"
            alt="Sign In"
          />
        </div> */}
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default Login;
