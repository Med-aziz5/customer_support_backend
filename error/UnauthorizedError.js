class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized', module = null) {
    super(message);
    this.name = 'Unauthorized';
    this.statusCode = 401;
    this.module = module;
  }
}

module.exports = UnauthorizedError;
