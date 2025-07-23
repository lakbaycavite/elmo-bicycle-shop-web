import axios from "axios";
import { useState } from "react";
import cld from "../cloudinary/cloudinary";

export const useCloudinaryUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const uploadImage = async (file) => {
        try {
            setUploading(true);
            setProgress(0);

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'your_upload_preset'); // From Cloudinary dashboard
            formData.append('folder', 'products');

            // Upload to Cloudinary with progress tracking
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    }
                }
            );

            setUploading(false);

            // Return the secure URL for the uploaded image
            return response.data.secure_url;
        } catch (error) {
            setUploading(false);
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // Function to generate transformed image URLs
    const getImageUrl = (publicId, { width, height, quality } = {}) => {
        if (!publicId) return null;

        let image = cld.image(publicId);

        if (width) image = image.resize(`w_${width}`);
        if (height) image = image.resize(`h_${height}`);
        if (quality) image = image.quality(quality);

        return image.toURL();
    };

    return { uploadImage, getImageUrl, uploading, progress };
};