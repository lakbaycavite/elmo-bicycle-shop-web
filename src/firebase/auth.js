import { createUserWithEmailAndPassword, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updateEmail, updatePassword } from "firebase/auth";
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

export const doEmailChange = async (currentPassword, newEmail) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("No user is currently logged in");
    }

    try {
        // Create credential with user's current email and password
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        // Reauthenticate the user
        await reauthenticateWithCredential(user, credential);

        // Reload user to get latest verification status
        await user.reload();
        const refreshedUser = auth.currentUser;

        // Check if email is verified
        if (!refreshedUser.emailVerified) {
            // Send verification email and store pending request
            await sendEmailVerification(refreshedUser);

            const db = getDatabase();
            await set(ref(db, 'users/' + user.uid + '/pendingEmailChange'), {
                newEmail: newEmail,
                requestedAt: new Date().toISOString(),
                status: 'awaiting_verification'
            });

            return {
                success: false,
                requiresVerification: true,
                message: 'Please check your current email and click the verification link, then try changing your email again.'
            };
        }

        // Try to update email directly
        try {
            await updateEmail(refreshedUser, newEmail);

            // If successful, update database
            const db = getDatabase();
            await set(ref(db, 'users/' + user.uid + '/email'), newEmail);
            await set(ref(db, 'users/' + user.uid + '/lastEmailUpdate'), new Date().toISOString());

            // Clear any pending email change requests
            await set(ref(db, 'users/' + user.uid + '/pendingEmailChange'), null);

            return { success: true, newEmail, requiresVerification: false };

        } catch (updateError) {
            console.error("Update email error:", updateError);

            // Handle specific Firebase errors
            if (updateError.code === 'auth/operation-not-allowed') {
                // This might happen if the Firebase project settings don't allow email changes
                return {
                    success: false,
                    message: 'Email changes are not allowed in this configuration. Please contact your administrator.',
                    adminRequired: true
                };
            } else if (updateError.code === 'auth/requires-recent-login') {
                return {
                    success: false,
                    message: 'Please sign out and sign back in, then try changing your email again.',
                    requiresReauth: true
                };
            }

            throw updateError;
        }
    } catch (error) {
        console.error("Error changing email:", error);
        throw error;
    }
}

// Check if user's email is verified
export const checkEmailVerificationStatus = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently logged in");
    }

    // Reload user to get latest status
    await user.reload();
    return auth.currentUser.emailVerified;
}

// Force refresh user token and verification status
export const refreshUserVerificationStatus = async () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user is currently logged in");
    }

    // Reload user data from Firebase
    await user.reload();

    // Get fresh token
    await user.getIdToken(true);

    return {
        emailVerified: auth.currentUser.emailVerified,
        email: auth.currentUser.email
    };
}

// Alternative method: Send verification to new email directly
export const doSendEmailChangeVerification = async (currentPassword, newEmail) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("No user is currently logged in");
    }

    try {
        // Create credential with user's current email and password
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        // Reauthenticate the user
        await reauthenticateWithCredential(user, credential);

        // Store the pending email change request
        const db = getDatabase();
        await set(ref(db, 'users/' + user.uid + '/pendingEmailChange'), {
            newEmail: newEmail,
            requestedAt: new Date().toISOString(),
            status: 'verification_sent'
        });

        // For now, we'll use a workaround - send verification to current email
        // and inform user to contact admin for email change
        await sendEmailVerification(user);

        return {
            success: true,
            message: 'Email change request submitted. Please verify your current email and contact administrator to complete the email change process.',
            requiresAdminAction: true
        };
    } catch (error) {
        console.error("Error requesting email change:", error);
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