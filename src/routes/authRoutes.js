import express from "express"
import authenticateToken from "../middlewares/Identifier.js";
import {signIn, signOut, signUp,
    changePassword,viewProfile, 
    deleteProfile,updateProfile
, sendForgotPasswordCode, verifySendForgotPasswordCode
} from "../controllers/authController.js"

const router = express.Router();

router.post("/signup", signUp)
router.post("/signin", signIn)
router.post("/signout", signOut)

router.patch("/change-password", authenticateToken,changePassword)
router.post("/forgot-password", sendForgotPasswordCode)
router.post("/reset-password", verifySendForgotPasswordCode)

router.delete("/delete-account", authenticateToken, deleteProfile)
router.patch("/update-account", authenticateToken, updateProfile)
router.get("/view-profile", viewProfile)


export default router;