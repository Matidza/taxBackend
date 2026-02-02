import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import doHash, { decryptHashedPassword } from "../utilities/hashingPaswords.js";
import { 
  signUpSchema, signInSchema, 
  changePasswordSchema, sendCodeSchema, 
  acceptForgotPasswordSchema,  updateUserModelSchema 
} from "../validators/validateUserModel.js";


import logger from "../config/logger.js";
import UserModel from "../models/userModel.js";
import sendEmail from "../middlewares/sendEmail.js";
import { withTransaction } from "../utilities/withTranaction.js";


dotenv.config();

export const signUp = async (request, response) => {
  const { email, password } = request.body;

  try {
    // Validate input
    const { error } = signUpSchema.validate({ email, password });
    if (error) {
      response.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return response.status(400).json({
        success: false,
        message: "Email already exists. Try a different one.",
      });
    }

    // Hash password
    const hashedPassword = await doHash(password, 10);

    // Create user
    const newUser = await UserModel.create({ email, password: hashedPassword });
    const result = newUser
    result.password = undefined;
    
    // // Create UserTaxDetails after SignUp
    // const userId = newUser._id
    // const taxDetails = await UserTaxDetails.create({
    //   userId
    // })
    // const saveTaxDetails = taxDetails.save()
    
    // Create tokens
    const accessToken = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
      },
      process.env.SECRET_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.SECRET_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // Set cookies
    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    response.status(201).json({
      success: true,
      message: `Account successfully created for ${newUser.email}`,
      result: result,
      type: newUser.userTaxDetails,
      mytype: newUser.type,
      
      accessToken: accessToken
    });
  } catch (error) {
    logger.error("Internal server error (Back-end server/Database has issues). Please try again later.")
    return response.status(500).json({
      success: false,
      message: "Internal server error (Back-end server/Database has issues). Please try again later.",
    });
  }
};


export const signIn = async (request, response) => {
    const { email, password} = request.body;
    try {
      const {error} = signInSchema.validate({ email, password})
      if (error) {
        return response.status(401).json({
          success: false,
          message: error.details[0].message
        })
      }

      const existingUser = await UserModel.findOne({ email }).select("+password")
      if (!existingUser) {
        return response.status(400).json({
          success: false,
          message: "Account doesn't exist, create one!"
        })
      }

      const isPasswordValid = await decryptHashedPassword(password, existingUser.password)
      if (!isPasswordValid) {
        return response.status(401).json({
          success: false,
          message: "password invalid"
        })
      }
      // const result = existingUser
      // result.password = undefined
      
     // Create tokens
    const accessToken = jwt.sign(
      {
        role: existingUser.role,
        userId: existingUser._id,
        email: existingUser.email,
      },
      process.env.SECRET_ACCESS_TOKEN,
      { expiresIn: "6000s" }
    );
    console.log(accessToken.userid)

    const refreshToken = jwt.sign(
      { userId: existingUser._id },
      process.env.SECRET_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // Set cookies
    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Step 6: Send response
    response.json({
      success: true,
      message: "Logged In successfully",
      accessToken: accessToken,
      // refreshToken: refreshToken,
    });

    } catch (error) {
        console.error("SignIn Error:", error);
        response.status(500).json({
        success: false,
        message: `Internal server error: ${error.message || error}`,
    });
    }
}

export async function signOut(request, response) {
    response.clearCookie("accessToken", "refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    }).clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    })//.redirect("http://localhost:3000/AUTH_MICROSERVICE/signup");

    logger.info("logged Out")
    return response.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
};



export const changePassword = async ( request, response) => {
  const { userId } = request.user;
  const { oldPassword, newPassword } = request.body
  try {
    const { error } = changePasswordSchema.validate({ oldPassword, newPassword})
    if (error) {
      return response.status(400).json({
        field: error.details[0].context.key,
        success: false,
        message: error.details[0].message,
      });
    }

    const existingUser = await UserModel.findOne({ _id:userId }).select("+password");
    if (!existingUser) {
      return response.status(400).json({
        success: false,
        message: "User  exists. Try a different one.",
      });
    }
    const isMatch = await decryptHashedPassword(oldPassword, existingUser.password);
    if (!isMatch) {
      return response.status(401).json({
        field: "oldPassword",
        success: false,
        message: "Invalid credentials",
      });
    }
    if (isMatch) {
      if (oldPassword === newPassword) {
        return response.status(401).json({
          field: "oldPassword",
          success: false,
          message: "New password matches the old password, try a different one",
        });
      } else {
        // ✅ 4. Hash and update new password
        existingUser.password = await doHash(newPassword, 12);
        await existingUser.save();

        return response.status(200).json({
          success: true,
          message: "🔒 Password updated successfully",
        });
      }
    }

    

  } catch (error) {
      console.error("❌ changePassword Error:", error);
    return response.status(500).json({
      success: false,
      field: null,
      message: "Internal server error",
    });
  }
}

export const sendForgotPasswordCode = async (request, response) => {
  const { email } = request.body;
  try {
    // Step 1: Validate input
    const { error } = sendCodeSchema.validate({ email });
    if (error) {
      return response.status(400).json({
        field: error.details[0].context.key,
        success: false,
        message: error.details[0].message,
      });
    }

    // Step 2: Search across multiple models 
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return response.status(404).json({
        field: "email",
        success: false,
        message: "User doesn't exist",
      });
    }

    // Step 3: Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Reset Code:", resetCode);

    // Step 4: Send email
    const sendingEmail = await sendEmail.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: existingUser.email,
      subject: 'Forgot Your Password – Verification Code Inside',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #24292e;">Password Reset Request</h2>
            <p>Hello ${existingUser.email || ''},</p>
            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #4CAF50;">${resetCode}</span>
            </div>
            <p style="text-align: center;">
                <a href="http://localhost:3000/verify-reset-code?email=${existingUser.email}"
                   style="display: inline-block; padding: 12px 24px; background-color: #2ea44f; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Verify Code
                </a>
            </p>
            <p><strong>Note:</strong> This code will expire in 5 minutes. If you didn’t request this, you can safely ignore this email.</p>
            <p>Thanks,<br>The Support Team</p>
        </div>
      `
    });

    if (sendingEmail.accepted[0] === existingUser.email) {
      // Step 5: Save hashed reset code
      const hashedValue = hmacProcess(resetCode, process.env.HMAC_VERIFICATION_CODE_SECRET);
      existingUser.forgotPasswordCode = hashedValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();

      return response.status(200).json({
        success: true,
        field: null,
        message: `Code sent to your ${existingUser.email}`,
        code: resetCode // For testing only
      });
    }

    return response.status(500).json({
      success: false,
      field: null,
      message: "Failed to send the verification code",
    });

  } catch (error) {
    console.error("❌ sendForgotPasswordCode Error:", error);
    return response.status(500).json({
      success: false,
      field: null,
      message: "Internal server error",
    });
  }
}

export const verifySendForgotPasswordCode = async (req, res) =>  {
  const { email, providedCodeValue, newPassword } = req.body;

  try {
    // Step 1: Validate input
    const { error } = acceptForgotPasswordSchema.validate({ email, providedCodeValue, newPassword });
    if (error) {
      return res.status(400).json({
        success: false,
        field: error.details[0].context.key,
        message: error.details[0].message,
      });
    }

    // Step 2: Search across multiple models
    const models = [
      { name: "UserModel", model: UserModel },
      { name: "MentorModel", model: MentorModel },
      { name: "CompanyModel", model: CompanyModel },
      { name: "InstitutionModel", model: InstitutionModel },
    ];

    let existingUser = null;
    for (const { name, model } of models) {
      try {
        existingUser = await model.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation +password');
        if (existingUser) {
          console.log(`✅ Found user in ${name}`);
          break;
        }
      } catch (err) {
        console.error(`❌ Error querying ${name}:`, err.message);
      }
    }

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        field: 'email',
        message: "User doesn't exist",
      });
    }

    // Step 3: Check if reset code exists
    if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
      return res.status(400).json({
        success: false,
        field: null,
        message: "Reset code not found. Please request a new one.",
      });
    }

    // Step 4: Expiry check (5 minutes)
    if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
      return res.status(401).json({
        success: false,
        field: null,
        message: "Code has expired! Please request a new one.",
      });
    }

    // Step 5: Hash and compare code
    if (!process.env.HMAC_VERIFICATION_CODE_SECRET) {
      console.error("❌ HMAC secret missing in .env");
      return res.status(500).json({
        success: false,
        field: null,
        message: "Server configuration error",
      });
    }

    const hashedCode = hmacProcess(providedCodeValue.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);

    if (hashedCode !== existingUser.forgotPasswordCode) {
      return res.status(400).json({
        success: false,
        field: 'providedCodeValue',
        message: "Invalid code",
      });
    }

    // Step 6: Update password
    existingUser.password = await doHash(newPassword, 12);
    existingUser.forgotPasswordCode = undefined;
    existingUser.forgotPasswordCodeValidation = undefined;
    await existingUser.save();

    return res.status(200).json({
      success: true,
      field: null,
      message: "Password reset was successful!",
    });

  } catch (err) {
    console.error("❌ verifysendForgotPasswordCode Error:", err);
    return res.status(500).json({
      success: false,
      field: null,
      message: "Internal server error",
    });
  }
}



// // ✅ View Mentor Profile
export const viewProfile = async (request, response) => {
    const {_id, } = request.query;
    const { userId } = request.user

    try {
        const userProfile = await UserModel.findOne({_id})
          // .populate({
          //     path: "userId",
          //     select: ["email", "type", "name", "avatar"]
          // })
          
        if (!userProfile) {
            return response.status(400).json({
                success: false,
                message: "Profile doesn't exist, create One!"
            })
        }
        // Check if userId in onboard profile belobngs to UserId
        if (userProfile) {
          // console.log(userId)
          // console.log(userProfile._id)

          if (userId === userProfile._id.toString()) {
            response.status(200).json({
                success: true,
                message: "single profile",
                profile: userProfile
            })
          } else if (userId !== userProfile.userId.toString()) {
            response.status(200).json({
                success: false,
                message: "Unauthorized, profile doesn't belong to user!!",
            })
          }
        }

        
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            field: null,
            success: false,
            message: error.details[0].message,
            messages: "Internal server error. Please try again later."
        });
    }
}

export const updateProfile = async (request, response) => {
  const {_id} = request.query;
  const { name, email, avatar } = request.body;
  const { userId } = request.user; // ✅  Comes from JWT payload

  try{
      const {value, error } = updateUserModelSchema.validate({
        name, email, avatar
      })
      if (error) {
        return response.status(400).json({
            success: false,
            message: error.details[0].message
        });
      }

      const existingProfile = await UserModel.findOne({_id})
      if (!existingProfile) {
          return response.status(404).json({
              success: false,
              message: "Profile doesn't exist, create one !"
          });
      }
      /** */
      if (userId !== existingProfile._id.toString()) {
            return response.status(403).json({
              success: false,
              message: "Unauthorized, login is required!"
          });
      } else if (existingProfile._id.toString() === userId) {
        // testing
        // console.log(userId)
        // console.log(existingProfile._id)

        existingProfile.name = name || existingProfile.name;
        existingProfile.email = email || existingProfile.email;
        existingProfile.avatar = avatar || existingProfile.avatar;

        const updatedProfile = await existingProfile.save()
        response.status(200).json({
            success: true,
            message: "Profile was updated!",
            updatedProfile: updatedProfile,
        })
      }
     
  } catch(error) {
      //console.log(error);
      return response.status(500).json({
          field: null,
          success: false,
          message: error.details[0].message,
          messages: "Internal server error. Please try again later."
      });
  }
}

export const deleteProfile = async (request, response) => {
    const {_id} = request.query;
    const {userId} = request.user;

    try {
        const existingProfile = await UserModel.findOne({_id})
        if (!existingProfile) {
            return response.status(404).json({
                success: false,
                message: "User doesn't exist!"
            })
        }
        /** */
        if (userId !== existingProfile._id.toString()) {
            return response.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        } else if (userId === existingProfile._id.toString()) {
          // console.log(userId)
          // console.log(existingProfile._id.toString())
          await UserModel.deleteOne({_Id})
          response.status(201).json({
              success: true,
              message: "Account delete successfully"
          })
        } 
    } catch(error) {
        return response.status(500).json({
            success: false,
            field: null,
            message: error.details[0].message
        })
    }
}