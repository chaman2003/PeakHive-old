/**
 * Middleware to handle async errors in Express routes
 * Eliminates the need for try/catch blocks in route handlers
 * @param {Function} fn - Async function to execute
 * @returns {Function} - Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 