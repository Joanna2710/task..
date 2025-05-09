import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAMYFBVd7qozfaQ2xyhTON1tVazAxRdV2o",
  authDomain: "town-team-96276.firebaseapp.com",
  projectId: "town-team-96276",
  storageBucket: "town-team-96276.appspot.com",
  messagingSenderId: "480857308305",
  appId: "1:480857308305:web:f3217bc68e75ff99245330",
  measurementId: "G-8G9GCM0DQE",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };
