const httpStatus = require('http-status');

/**
 * For API Error
 */
class APIError extends Error{

    /**
     * Creates an API error.
     * @param  message - Error message.
     * @param {number} status - HTTP status code of error.
     */
    constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.status = status;
        Error.captureStackTrace(this, this.constructor.name);
    }
}

module.exports = APIError;
