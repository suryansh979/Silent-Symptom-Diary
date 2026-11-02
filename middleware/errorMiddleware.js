// backend/middleware/errorMiddleware.js

// This handles routes that don't exist (404 Not Found)
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Passes the error to the errorHandler below
};

// The Global Error Handler
const errorHandler = (err, req, res, next) => {
    // If the status code is still 200, change it to 500 (Server Error)
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle specific Mongoose Database Errors (e.g., CastError for invalid IDs)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        // Show the stack trace (the file/line number of the error) ONLY in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };