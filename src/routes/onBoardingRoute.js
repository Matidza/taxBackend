import express from "express"
import authenticateToken from "../middlewares/Identifier.js";
import {deleteOnboard, onBoarding, updateOnboard, viewOnboard} from "../controllers/onBordingController.js"

const router = express.Router();

router.get('/view', authenticateToken, viewOnboard)
router.post("/create", authenticateToken, onBoarding)
router.put('/update', authenticateToken, updateOnboard),
router.delete('/delete', authenticateToken, deleteOnboard)

export default router;