class BusinessError extends Error {
  constructor(code, message, statusCode = 422) {
    super(message);
    this.name = "BusinessError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = {};
  }

  addDetail(field, message) {
    this.details[field] = message;
  }
}

module.exports = BusinessError;
