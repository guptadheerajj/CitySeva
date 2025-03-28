import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyC-8nlxP2LylRRapHtPMdvt11c2HcodEdc",
	authDomain: "authentication-e33e6.firebaseapp.com",
	projectId: "authentication-e33e6",
	storageBucket: "authentication-e33e6.firebasestorage.app",
	messagingSenderId: "1063507672025",
	appId: "1:1063507672025:web:b8487953744dbac91537c8",
	measurementId: "G-ZKVR5MQ9GY",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
