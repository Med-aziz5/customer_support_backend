class TechnicalError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.name = "TechnicalError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = {
      detail: null,
      source: null,
    };
  }
}

module.exports = TechnicalError;
