// services/ratingService.js
import { ref, push, serverTimestamp, get } from "firebase/database";
import { database } from "../firebase/firebase";

/**
 * Submits a rating to the Realtime Database
 * @param {Object} ratingData - Data object including productId, rating, comment, userId, etc.
 * @returns {Promise}
 */
export const submitRating = async (ratingData) => {
    if (!ratingData.productId) throw new Error("Product ID is required");

    const productRatingRef = ref(database, `ratings/${ratingData.productId}`);
    return await push(productRatingRef, {
        ...ratingData,
        createdAt: serverTimestamp(),
        timestamp: Date.now(),
    });
};

/**
 * Submits multiple ratings in batch
 * @param {Array<Object>} ratings - Array of rating objects
 */
export const submitRatingsBatch = async (ratings = []) => {
    const promises = ratings.map((rating) => submitRating(rating));
    return await Promise.all(promises);
};

export const getRatingsByProductId = async (productId) => {
    const snapshot = await get(ref(database, 'ratings'));
    if (!snapshot.exists()) return [];

    const allRatings = snapshot.val();
    return Object.values(allRatings).filter(rating => rating.productId === productId);
};