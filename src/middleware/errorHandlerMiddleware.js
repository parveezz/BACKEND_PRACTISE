const errorHandlerMiddleware = (err, req, res, next) => {
    console.error("Global Error Handler caught:", err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default errorHandlerMiddleware;

