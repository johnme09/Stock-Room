export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFoundError = (resource = "Resource") =>
  new HttpError(404, `${resource} not found`);

