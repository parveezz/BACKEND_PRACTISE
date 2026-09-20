import multer from "multer";

const allowedMimeTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

const fileFilter = (req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new Error("Only MP4, WebM, OGG, and Quicktime videos are allowed"));
      }
      return callback(null, true);
};

const uploadVideo = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
      fileFilter,
});

export default uploadVideo;
