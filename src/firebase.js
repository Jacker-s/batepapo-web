import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAs2AKTk2uHSOU3x8e7eauvq1dnQe0h4Bs",
  authDomain: "frend-eb335.firebaseapp.com",
  databaseURL: "https://frend-eb335-default-rtdb.firebaseio.com",
  projectId: "frend-eb335",
  storageBucket: "frend-eb335.firebasestorage.app",
  messagingSenderId: "135221802523",
  appId: "1:135221802523:web:abcdef1234567890" // Mock web App ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
