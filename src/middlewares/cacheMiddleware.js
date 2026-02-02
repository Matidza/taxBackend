// cacheMiddleware.js
import { redis } from '../utilities/redis.js';

export const cache = (keyBuilder, ttl = 60) => {
  return async (req, res, next) => {
    try {
      const key = keyBuilder(req);

      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Monkey-patch res.json to cache response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        redis.setEx(key, ttl, JSON.stringify(body));
        return originalJson(body);
      };

      next();
    } catch (err) {
      next(); // fail open
    }
  };
};
