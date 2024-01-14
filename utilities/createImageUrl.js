const cloudinary = require("../cloudinary/config");

const createImageUrl = (publicId) => {

    // Create an image tag with transformations applied to the src URL
    let imageUrl = cloudinary.url(publicId, {
        transformation: [
            { width: 250, height: 250, crop: 'thumb' },
            // { radius: 'max' },
            // { effect: 'outline:10', color: effectColor },
            // { background: backgroundColor },
        ],
    });

    return imageUrl;
};

module.exports = createImageUrl