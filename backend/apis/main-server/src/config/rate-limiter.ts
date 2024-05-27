import rateLimit from 'express-rate-limit';

const hundredRequestsPerMinuteConfig = {
  windowMs: 60 * 1000,
  max: 100,
  message: 'You have exceeded the 100 requests in 1 minute limit!',
};

export const rateLimiter = rateLimit({
  ...hundredRequestsPerMinuteConfig,
  standardHeaders: true,
  legacyHeaders: false,
});
