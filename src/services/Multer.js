import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
      }

      return callback(null, true);
};

const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 },
      fileFilter,
});

export default upload;
