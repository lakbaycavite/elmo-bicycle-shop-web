import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { auth } from "./firebase";
import { getDatabase, ref, set } from "firebase/database";
import { useAuth } from "../context/authContext/createAuthContext";


export const doCreateUserWithEmailAndPassword = async (email, password, userData = {}) => {

    try {
        // Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Realtime Database
        const db = getDatabase();
        await set(ref(db, 'users/' + user.uid), {
            email: user.email,
            createdAt: new Date().toISOString(),
            role: userData.role || 'customer',
            // lastLogin: new Date().toISOString(),
            ...userData
        });

        return userCredential;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const createUserAsAdmin = async (email, password, userData = {}) => {


    try {
        // Get the current admin's ID token
        // const idToken = await auth.currentUser.getIdToken();

        // Firebase API key from your project settings
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY; // Make sure this is defined in your .env file

        // Use Firebase Auth REST API to create user
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: false // Important: set to false so it doesn't return tokens
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }

        const data = await response.json();
        const newUserId = data.localId;

        // Save additional data to database
        const db = getDatabase();

        await set(ref(db, 'users/' + newUserId), {
            email: email,
            createdAt: new Date().toISOString(),
            role: userData.role || 'customer',
            createdBy: "lanceballicud",
            ...userData
        });

        return {
            uid: newUserId,
            email,
            role: userData.role || 'customer',
        };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};


export const doSignInWithEmailAndPassword = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const doSignOut = async () => {
    return auth.signOut();
};

// Extras

export const doPasswordReset = async (email) => {
    return sendPasswordResetEmail(auth, email);
}

export const doPasswordChange = async (password) => {
    return updatePassword(auth.currentUser, password);
}

export const doSendEmailVerification = async () => {
    return sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/home`
    })
}


// For Google Sign-In.
// export const doSignInWithGoogle = async () => {
//     const provider = new GoogleAuthProvider();
//     const result = await signInWithPopup(auth, provider);



//     return result;
// }