// hooks/useRatings.js
import { useState } from "react";
import { submitRating, submitRatingsBatch } from "../services/ratingService";

export const useRatings = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const rateProduct = async (rating) => {
        try {
            setIsSubmitting(true);
            await submitRating(rating);
        } catch (err) {
            console.error("Error submitting rating:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const rateMultipleProducts = async (ratings) => {
        try {
            setIsSubmitting(true);
            await submitRatingsBatch(ratings);
        } catch (err) {
            console.error("Error submitting batch ratings:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };



    return {
        rateProduct,
        rateMultipleProducts,
        isSubmitting,
        error,
    };
};
