class NotFoundError extends Error {
  constructor(message = 'Resource not found', module = null) {
    super(message);
    this.name = 'NotFound';
    this.statusCode = 404;
    this.module = module;
  }
}

module.exports = NotFoundError;
