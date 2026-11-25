import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDNxfdlejFQAwn21Wwaq6zlBiKRxhlwr5Q",
  authDomain: "ecoquiz-adm.firebaseapp.com",
  projectId: "ecoquiz-adm",
  storageBucket: "ecoquiz-adm.firebasestorage.app",
  messagingSenderId: "769625976432",
  appId: "1:769625976432:web:469089eb4253f0f6920eb5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
