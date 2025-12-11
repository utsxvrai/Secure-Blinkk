const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalServerError
} = require('../../src/utils/errors');

describe('Error Classes', () => {
  test('AppError should allow setting message and statusCode', () => {
    const error = new AppError('Test Error', 418);
    expect(error.message).toBe('Test Error');
    expect(error.statusCode).toBe(418);
    expect(error).toBeInstanceOf(Error);
  });

  test('ValidationError should have default status 400', () => {
    const error = new ValidationError('Invalid Input');
    expect(error.message).toBe('Invalid Input');
    expect(error.statusCode).toBe(400);
    expect(error).toBeInstanceOf(AppError);
  });

  test('AuthenticationError should have default status 401', () => {
    const error = new AuthenticationError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication Failed'); // Default message
  });

  test('AuthorizationError should have default status 403', () => {
    const error = new AuthorizationError('Forbidden');
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Forbidden');
  });

  test('NotFoundError should have default status 404', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
  });

  test('ConflictError should have default status 409', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
  });

  test('InternalServerError should have default status 500', () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(500);
  });
});
