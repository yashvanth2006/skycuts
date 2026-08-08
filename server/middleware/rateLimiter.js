// In-memory rate limiting middleware
// Tracks requests by IP address to prevent abuse

const requestCounts = new Map();
const requestTimestamps = new Map();

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message when limit exceeded
 * @returns {Function} Express middleware function
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100,
    message = 'Too many requests, please try again later',
  } = options;

  return (req, res, next) => {
    // Get client IP (handle proxy scenarios)
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries periodically
    if (requestTimestamps.has(ip)) {
      const timestamps = requestTimestamps.get(ip);
      // Remove timestamps outside the current window
      const validTimestamps = timestamps.filter(ts => ts > windowStart);
      requestTimestamps.set(ip, validTimestamps);
      requestCounts.set(ip, validTimestamps.length);
    }

    // Get current request count for this IP
    const currentCount = requestCounts.get(ip) || 0;

    if (currentCount >= maxRequests) {
      // Rate limit exceeded
      const oldestRequest = requestTimestamps.get(ip)?.[0];
      const retryAfter = oldestRequest ? Math.ceil((oldestRequest + windowMs - now) / 1000) : windowMs / 1000;

      return res.status(429).json({
        message,
        retryAfter: `${retryAfter} seconds`,
      });
    }

    // Increment request count
    requestCounts.set(ip, currentCount + 1);

    // Add timestamp
    if (!requestTimestamps.has(ip)) {
      requestTimestamps.set(ip, []);
    }
    requestTimestamps.get(ip).push(now);

    next();
  };
};

// Pre-configured rate limiters for different use cases

// Strict rate limiter for sensitive operations (login, password reset)
export const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
  message: 'Too many login attempts, please try again later',
});

// Moderate rate limiter for form submissions (project requests, contact forms)
export const moderateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 requests per hour
  message: 'Too many submissions, please try again later',
});

// Bulk operations rate limiter (bulk client creation, bulk updates)
export const bulkLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 bulk operations per hour
  message: 'Too many bulk operations, please try again later',
});

// General API rate limiter for all other routes
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
});

// Cleanup function to prevent memory leaks (call periodically)
export const cleanupRateLimiter = () => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // Use the largest window
  const windowStart = now - windowMs;

  for (const [ip, timestamps] of requestTimestamps.entries()) {
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    if (validTimestamps.length === 0) {
      requestTimestamps.delete(ip);
      requestCounts.delete(ip);
    } else {
      requestTimestamps.set(ip, validTimestamps);
      requestCounts.set(ip, validTimestamps.length);
    }
  }
};

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiter, 5 * 60 * 1000);
}
