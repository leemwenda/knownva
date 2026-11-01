export class HttpError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    if (code) this.code = code;
  }

  static badRequest(msg = "Bad request") { return new HttpError(400, msg); }
  static unauthorized(msg = "Authentication required") { return new HttpError(401, msg); }
  static forbidden(msg = "You do not have permission to perform this action") { return new HttpError(403, msg); }
  static notFound(msg = "Not found") { return new HttpError(404, msg); }
  static conflict(msg = "Conflict") { return new HttpError(409, msg); }
  static unprocessable(msg = "Unprocessable entity") { return new HttpError(422, msg); }
  static tooMany(msg = "Too many requests") { return new HttpError(429, msg); }
}
