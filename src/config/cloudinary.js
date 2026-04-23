const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer  - file buffer from multer memoryStorage
 * @param {object} options - Cloudinary upload options (folder, public_id, etc.)
 * @returns {Promise<object>} Cloudinary upload result
 */
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

/**
 * Delete a Cloudinary asset by public_id.
 * @param {string} publicId
 * @returns {Promise<object>}
 */
function destroy(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

/**
 * Check if a Cloudinary resource exists.
 * @param {string} publicId
 * @returns {Promise<object|null>} resource info or null
 */
async function getResource(publicId) {
  try {
    return await cloudinary.api.resource(publicId, { resource_type: "image" });
  } catch (err) {
    if (err.http_code === 404) return null;
    throw err;
  }
}

module.exports = { cloudinary, uploadBuffer, destroy, getResource };
