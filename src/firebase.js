// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoNCJzgduJWBW8zO-a-iN8KUUFHfYfZV0",
  authDomain: "ar-videoviewer.firebaseapp.com",
  projectId: "ar-videoviewer",
  storageBucket: "ar-videoviewer.appspot.com",
  messagingSenderId: "582459290664",
  appId: "1:582459290664:web:6dcc36eb33c1444d52b11d",
  measurementId: "G-FEDDL45RQM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { storage };