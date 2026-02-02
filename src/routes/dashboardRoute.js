import express from "express"
import authenticateToken from "../middlewares/autentificateToken.js";
import { dashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get('/', authenticateToken, dashboard)


export default router;