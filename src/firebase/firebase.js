// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBNnVJWAWz1JMoNWHOKtu1eTvnI4zJxJDI",
    authDomain: "registration-32653.firebaseapp.com",
    databaseURL: "https://registration-32653-default-rtdb.firebaseio.com",
    projectId: "registration-32653",
    storageBucket: "registration-32653.firebasestorage.app",
    messagingSenderId: "284273164556",
    appId: "1:284273164556:web:9768bbba5ba996da690929"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };