
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getStorage, ref,getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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
const storage = getStorage(app);
export { storage , ref , getDownloadURL};