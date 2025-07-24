import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Create a Cloudinary instance
const cld = new Cloudinary({
    cloud: {
        cloudName
    }
});

export { cld, cloudName };