import express from "express"
import authenticateToken from "../middlewares/Identifier.js";
import { dashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get('/dashboard', authenticateToken, dashboard)


export default router;