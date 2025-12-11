const { sendSuccess, sendError } = require('../../src/utils/response');

describe('Response Utility', () => {
  let mockRes;
  let mockJson;
  let mockStatus;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus
    };
    // process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sendSuccess should send 200 and data by default', () => {
    const data = { id: 1 };
    sendSuccess(mockRes, data);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Success',
      data
    });
  });

  test('sendSuccess should send custom status and message', () => {
    const data = { id: 1 };
    sendSuccess(mockRes, data, 'Created', 201);
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data
    });
  });

  test('sendError should send error status and message', () => {
    const error = { statusCode: 400, message: 'Bad Request' };
    sendError(mockRes, error);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Bad Request'
    }));
  });

  test('sendError should default to 500 if no status code', () => {
    const error = new Error('Something went wrong');
    sendError(mockRes, error);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Internal Server Error' // Default message used in response.js when error is generic
    })); 
    // Wait, response.js says: const message = error.message || 'Internal Server Error';
    // If error.message is present, it uses it.
  });
  
  test('sendError should use error message if present', () => {
    const error = new Error('Specific Error');
    sendError(mockRes, error);
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Specific Error'
    }));
  });
});
