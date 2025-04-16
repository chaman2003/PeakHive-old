import process from 'process';

/**
 * Enhanced logger utility with different log levels
 * Supports structured logging with context objects
 */
const logger = {
  info: (message, context = {}) => {
    console.log(`INFO [${new Date().toISOString()}]: ${message}`);
    if (Object.keys(context).length > 0) {
      console.log(JSON.stringify(context, null, 2));
    }
  },
  
  warn: (message, context = {}) => {
    console.warn(`WARNING [${new Date().toISOString()}]: ${message}`);
    if (Object.keys(context).length > 0) {
      console.warn(JSON.stringify(context, null, 2));
    }
  },
  
  error: (message, context = {}) => {
    console.error(`ERROR [${new Date().toISOString()}]: ${message}`);
    if (context.error) {
      console.error(context.error);
    }
    if (Object.keys(context).length > 0) {
      console.error(JSON.stringify(context, null, 2));
    }
  },
  
  debug: (message, context = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`DEBUG [${new Date().toISOString()}]: ${message}`);
      if (Object.keys(context).length > 0) {
        console.log(JSON.stringify(context, null, 2));
      }
    }
  }
};

export { logger }; 