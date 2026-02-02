// // middlewares/onboardingRateLimiter.js
import { redis } from '../utilities/redis.js';

export const onboardingRateLimiter = ({ limit, window }) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      const ip = req.ip;

      const key = userId
        ? `rate:onboarding:user:${userId}`
        : `rate:onboarding:ip:${ip}`;

      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, window);
      }

      if (count > limit) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Try again later.',
        });
      }

      next();
    } catch (err) {
      console.error('Rate limiter error:', err);
      next();
    }
  };
};


// import { redis } from '../utilities/redis.js';

// export const onboardingRateLimiter = ({
//   limit = 100,
//   window = 60, // seconds
// }) => {
//   return async (req, res, next) => {
//     try {
//       const key = `rate:${req.ip}`;
//       const count = await redis.incr(key);

//       if (count === 1) {
//         await redis.expire(key, window);
//       }

//       if (count > limit) {
//         return res.status(429).json({
//           message: 'Too many requests. Try again later.',
//         });
//       }

//       next();
//     } catch (err) {
//       // Fail open (don’t block traffic if Redis fails)
//       next();
//     }
//   };
// };

