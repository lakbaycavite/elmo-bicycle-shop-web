import { createUserWithEmailAndPassword, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { auth } from "./firebase";
import { get, getDatabase, ref, set } from "firebase/database";


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
    try {
        // First, perform the Firebase authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // After successful authentication, check if the account is disabled
        const db = getDatabase();
        const userRef = ref(db, 'users/' + userCredential.user.uid);
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();

            // Check if the account is disabled
            if (userData.accountStatus === "disabled") {
                // Sign out the user immediately
                await auth.signOut();
                throw new Error("ACCOUNT_DISABLED");
            }

            // Update last login time
            await set(ref(db, 'users/' + userCredential.user.uid + '/lastLogin'), new Date().toISOString());
        }

        return userCredential;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export const doSignOut = async () => {
    return auth.signOut();
};

// Extras

export const doPasswordReset = async (email) => {
    return sendPasswordResetEmail(auth, email);
}

export const doPasswordChange = async (currentPassword, newPassword) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("No user is currently logged in");
    }

    try {
        // Create credential with user's email and current password
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        // Reauthenticate the user
        await reauthenticateWithCredential(user, credential);

        // Now change the password
        return updatePassword(user, newPassword);
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
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