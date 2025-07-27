// services/ratingService.js
import { ref, push, serverTimestamp } from "firebase/database";
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
