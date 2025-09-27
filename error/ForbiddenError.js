class ForbiddenError extends Error {
  constructor(message = "Forbidden", module = null) {
    super(message);
    this.name = "Forbidden";
    this.statusCode = 403;
    this.module = module;
  }
}

module.exports = ForbiddenError;
