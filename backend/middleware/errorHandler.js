const errorHandler = (err, req, res, next) => {
    console.log(err.stack.red);
  
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: message
      });
    }
  
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value entered'
      });
    }
  
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: `Resource not found with id of ${err.value}`
      });
    }
  
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Server Error'
    });
  };
  
  module.exports = errorHandler;