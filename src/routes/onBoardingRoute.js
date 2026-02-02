import express from "express"
import authenticateToken from "../middlewares/autentificateToken.js";
import { onboardingRateLimiter } from "../middlewares/onboardingRateLimiter.js";
import {deleteOnboard, onBoarding, updateOnboard, viewOnboard} from "../controllers/onBordingController.js"

const router = express.Router();

router.get('/profile', authenticateToken, onboardingRateLimiter({limit: 100, wimdow: 6000}), viewOnboard) // cache this
router.post("/create", authenticateToken, onboardingRateLimiter({ limit: 3, window: 600 }), onBoarding)
router.put('/update', authenticateToken, onboardingRateLimiter({limit: 5, wimdow: 600}), updateOnboard),
router.delete('/delete', authenticateToken, onboardingRateLimiter({limit: 5, wimdow: 600}), deleteOnboard) // rate limit

export default router;


/**
 * 
 * import { onboardingRateLimiter } from '../middlewares/onboardingRateLimiter.js';

router.post('/create', authenticateToken, onboardingRateLimiter({ limit: 3, window: 600 }),
  onBoarding
);
*/
 