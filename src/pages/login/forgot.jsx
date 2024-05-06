import { Link } from "react-router-dom";
import "./login.css";


function Forgot() {
    return (
        <div className="box-container">
   <div className="box">
        <span className="box__borderline" />
        <form className="form" action="#">
          <img src="/nexa.png" className="form_img"/>
          <h3 className="form__title">NexaConnect</h3>
          <div className="form__box">
            <input className="form__input" type="email" required="required" />
            <span className="form__span">Email</span>
            <i className="form__line" />
          </div>
        
          <div className="form__links">
            <Link className="form__link" to="/login">
             Login
            </Link>
           
          </div>
          <button className="form__submit" type="submit">Forgot Password</button>
        </form>
      </div>
        </div>
     
      
    );
}

export default Forgot;