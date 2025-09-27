class ConflictError extends Error {
  constructor(message = "Conflict error", module = null) {
    super(message);
    this.name = "Conflict";
    this.statusCode = 409;
    this.module = module;
  }
}

module.exports = ConflictError;
