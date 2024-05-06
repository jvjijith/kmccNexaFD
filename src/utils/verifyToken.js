import { getAuth, onAuthStateChanged } from "firebase/auth";
import appFirebase from "../config/firebase";

 const verifyToken = async (token) => {
  const auth = getAuth(appFirebase);

  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, check if the token matches
        user.getIdToken().then((idToken) => {
          if (token === idToken) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        // User is signed out
        resolve(false);
      }
    });
  });
};

export default verifyToken;
