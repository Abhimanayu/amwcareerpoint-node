const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

function getImageKitConfig() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !urlEndpoint) {
    const missing = [
      !privateKey && "IMAGEKIT_PRIVATE_KEY",
      !urlEndpoint && "IMAGEKIT_URL_ENDPOINT",
    ].filter(Boolean);
    const err = new Error(`Missing ImageKit environment variables: ${missing.join(", ")}`);
    err.code = "IMAGEKIT_CONFIG_ERROR";
    throw err;
  }

  return {
    privateKey,
    urlEndpoint: urlEndpoint.replace(/\/$/, ""),
  };
}

async function uploadBuffer(buffer, options = {}) {
  const { privateKey } = getImageKitConfig();
  const folder = options.folder || "/amw/general";
  const fileName = options.fileName || `${Date.now()}.png`;

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: options.mimetype || "application/octet-stream" }), fileName);
  formData.append("fileName", fileName);
  formData.append("folder", folder.startsWith("/") ? folder : `/${folder}`);
  formData.append("useUniqueFileName", "false");

  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
    },
    body: formData,
  });

  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { message: text };
  }

  if (!response.ok) {
    const err = new Error(payload.message || `ImageKit upload failed with ${response.status}`);
    err.code = "IMAGEKIT_ERROR";
    err.statusCode = response.status;
    err.details = payload;
    throw err;
  }

  return {
    url: payload.url,
    publicId: payload.fileId || payload.filePath || payload.name,
    fileId: payload.fileId,
    filePath: payload.filePath,
    name: payload.name,
    size: payload.size,
  };
}

module.exports = { uploadBuffer };
