import { Link } from "react-router-dom";
import "./login.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import appFirebase from "../../config/firebase";
import useFormInput from "../../hooks/useFormInput";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

function Login() {
  const email = useFormInput("");
  const password = useFormInput("");
  const auth = getAuth(appFirebase);
  const navigate = useNavigate();
  const [userObj, setUserObj] = useLocalStorage("user", null);

  async function signInWEAP(event) {
    event.preventDefault();
    await signInWithEmailAndPassword(auth, email.value, password.value)
      .then((userCredential) => {
        // Signed in
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
        console.log(userCredential._tokenResponse.refreshToken);
        const authObj = {
          accessToken: user.accessToken,
          refreshToken: userCredential._tokenResponse.refreshToken,
          email: user.email,
          uid: user.uid,
        };
        setUserObj(authObj);
        console.log(userObj);

        navigate("/");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(errorMessage, {
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
      });
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
