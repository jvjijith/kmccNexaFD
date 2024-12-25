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

function Login() {
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
      console.error("Error fetching employee data:", error);
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
    
      // Prepare authentication object
      const authObj = {
        accessToken: user.accessToken,
        refreshToken: accessTokenData.refreshToken,
        email: user.email,
        uid: user.uid,
      };
    
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
    <div className="box-container">
      <div className="box">
        <span className="box__borderline" />
        <form className="form" onSubmit={signInWEAP}>
          <img src="/nexa.png" className="form_img" />
          <h3 className="form__title">NexaConnect</h3>
          <div className="form__box">
            <input
              className="form__input"
              type="email"
              required="required"
              name="email"
              {...email}
              placeholder="Email"
            />
          </div>
          <div className="form__box">
            <input
              className="form__input"
              type="password"
              required="required"
              name="password"
              {...password}
              placeholder="Password"
            />
          </div>
          <div className="form__links">
            <Link className="form__link" to="/forgot">
              Forgot Password
            </Link>
          </div>
          <button className="form__submit" type="submit">
            Login
          </button>
        </form>
      </div>
      <ToastContainer></ToastContainer>
    </div>
  );
}

export default Login;
