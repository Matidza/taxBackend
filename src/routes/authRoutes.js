import express from "express"
import authenticateToken from "../middlewares/autentificateToken.js";
import {signIn, signOut, signUp,
    changePassword,viewProfile, 
    deleteProfile,updateProfile
, sendForgotPasswordCode, verifySendForgotPasswordCode
} from "../controllers/authController.js"

const router = express.Router();

router.post("/signup", signUp)
router.post("/signin", signIn) // cache this
router.post("/signout", signOut)

router.patch("/change-password", authenticateToken,changePassword) // cache this
router.post("/forgot-password", sendForgotPasswordCode)
router.post("/reset-password", verifySendForgotPasswordCode)

router.delete("/delete-account", authenticateToken, deleteProfile)
router.patch("/update-account", authenticateToken, updateProfile)
router.get("/profile", authenticateToken, viewProfile) // cache this


export default router;