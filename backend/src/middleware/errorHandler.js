import AppError from '../errors/AppError.js';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        status: err.status,
        message: err.message,
      },
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: {
      status: 500,
      message: 'Internal server error',
    },
  });
}

export default errorHandler;
