import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./credentials.js";



const appFirebase = initializeApp(firebaseConfig);

export default appFirebase;