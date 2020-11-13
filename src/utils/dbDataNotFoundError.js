/* eslint-disable require-jsdoc */
import ApplicationError from './applicationError';

class dbDataNotFoundError extends ApplicationError {
  constructor(message) {
    super(message, 404);
  }
}

export default dbDataNotFoundError;
