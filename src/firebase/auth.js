import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { auth } from "./firebase";
import { getDatabase, ref, set } from "firebase/database";

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