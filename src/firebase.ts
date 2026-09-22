import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXYbiZ1BBi3ccHEQVsdfjjaWk58STYr6g",
  authDomain: "nth-grin-fr5vm.firebaseapp.com",
  projectId: "nth-grin-fr5vm",
  storageBucket: "nth-grin-fr5vm.firebasestorage.app",
  messagingSenderId: "996621879969",
  appId: "1:996621879969:web:3fbf7f6c265bb895587ee0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-04490345-1451-43c3-87e3-0c8eb2a42cf8");
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
};
export type { User };
