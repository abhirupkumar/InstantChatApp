import { initializeApp } from "firebase/app";

export const getFirebaseApp = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyDprayjqK7ia-rbUwWGLyKOx9T9HMy6wkI",
        authDomain: "instantchatapp-4919d.firebaseapp.com",
        projectId: "instantchatapp-4919d",
        storageBucket: "instantchatapp-4919d.appspot.com",
        messagingSenderId: "230485511113",
        appId: "1:230485511113:web:c18279f9571b54d8fff618",
        measurementId: "G-4X4V7XDQNG"
    };

    return initializeApp(firebaseConfig);
}