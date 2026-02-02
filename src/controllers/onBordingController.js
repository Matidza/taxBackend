import UserModel from "../models/userModel.js";
import doHash from "../utilities/hashingPaswords.js";
import OnBoardingModel from "../models/onBoardingModel.js";
import onBoardingSchema from "../validators/validateOnBoarding.js";


import mongoose from "mongoose"
import { redis } from "../utilities/redis.js";
import { withTransaction } from "../utilities/withTranaction.js";



// Wrapp with withTransaction()
// export const onBoarding = withTransaction(async (req, res) => {
//   const session = req.mongoSession;
//   const { userId, role } = req.user;

//   const {
//     saIdNumber,
//     sarsTaxNumber,
//     vatNumber,
//     businessStructure,
//     financialYearEnd,
//     estimatedAnnualIncome,
//     managedTaxes,
//     accountingIntegration,
//     taxYear,
//     audit,
//   } = req.body;

//   const { error } = onBoardingSchema.validate({
//     userId,
//     role,
//     saIdNumber,
//     sarsTaxNumber,
//     vatNumber,
//     businessStructure,
//     financialYearEnd,
//     estimatedAnnualIncome,
//     managedTaxes,
//     accountingIntegration,
//     taxYear,
//     audit,
//   });

//   if (error) {
//     throw new Error(error.details[0].message);
//   }

//   const existingProfile = await OnBoardingModel.findOne({
//     userId,
//     sarsTaxNumber,
//   }).session(session);

//   if (existingProfile) {
//     throw new Error("Onboarding profile already exists");
//   }

//   const hashedTaxNumber = await doHash(sarsTaxNumber, 10);

//   const newProfile = await OnBoardingModel.create(
//     [{
//       userId,
//       role,
//       saIdNumber,
//       sarsTaxNumber: hashedTaxNumber,
//       vatNumber,
//       businessStructure,
//       financialYearEnd,
//       estimatedAnnualIncome,
//       managedTaxes,
//       accountingIntegration,
//       taxYear,
//       audit,
//     }],
//     { session }
//   );

//   const user = await UserModel.findById(userId).session(session);
//   if (user && user.type !== role) {
//     user.type = role;
//     await user.save({ session });
//   }

//   res.status(201).json({
//     success: true,
//     message: "Onboarding completed successfully",
//     result: newProfile,
//   });
// });
export const onBoarding = withTransaction(async (req, res) => {
  const session = req.mongoSession;
  const { userId, role } = req.user;

  // 1️⃣ Prepare payload for validation
  const payload = {
    ...req.body,
    userId,
    role,
  };

  // 2️⃣ Validate input
  const { error, value } = onBoardingSchema.validate(payload, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const {
    saIdNumber,
    sarsTaxNumber,
    vatNumber,
    businessStructure,
    financialYearEnd,
    estimatedAnnualIncome,
    managedTaxes,
    accountingIntegration,
    taxYear,
    audit,
  } = value;

  // 3️⃣ Check if user has already onboarded
  const existingProfile = await OnBoardingModel.findOne({ userId }).session(session);
  if (existingProfile) {
    return res.status(400).json({
      success: false,
      message: "User has already completed onboarding",
    });
  }

  // 4️⃣ Hash SARS Tax Number
  const hashedTaxNumber = await doHash(sarsTaxNumber, 10);

  // 5️⃣ Auto-assign managed taxes if not provided
  let finalManagedTaxes = managedTaxes;
  if (!managedTaxes || managedTaxes.length === 0) {
    if (role === "tax_payer" && businessStructure === "individual") finalManagedTaxes = ["ITR12"];
    if (role === "tax_payer" && businessStructure === "trust") finalManagedTaxes = ["ITR14"];
    if (role === "business" || businessStructure === "pty_ltd") finalManagedTaxes = ["VAT201"];
  }

  // 6️⃣ Fill audit info automatically if missing
  const auditLog = {
    action: "onboarding",
    performedBy: req.user.userId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || "unknown",
    timestamp: new Date(),
    ...audit,
  };

  // 7️⃣ Create onboarding profile
  const newProfile = await OnBoardingModel.create(
    [{
      userId,
      role,
      saIdNumber,
      sarsTaxNumber: hashedTaxNumber,
      vatNumber,
      businessStructure,
      financialYearEnd,
      estimatedAnnualIncome,
      managedTaxes: finalManagedTaxes,
      accountingIntegration,
      taxYear,
      audit: auditLog,
    }],
    { session }
  );

  // 8️⃣ Update user's type if needed
  const user = await UserModel.findById(userId).session(session);
  if (user && user.type !== role) {
    user.type = role;
    await user.save({ session });
  }

  // 9️⃣ Respond
  res.status(201).json({
    success: true,
    message: "Onboarding completed successfully",
    result: newProfile,
  });
});


// export const viewOnboard = async (request, response) => {
//   const { _id } = request.query;
//   const { userId } = request.user;

//   if (!mongoose.Types.ObjectId.isValid(_id)) {
//     return response.status(400).json({
//       success: false,
//       message: "Invalid profile ID"
//     });
//   }

//   try {
//     const cacheKey = `onboard:profile:${userId}:${_id}`;

//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       console.log(`[Redis] HIT ${cacheKey}`);
//       return response.status(200).json(JSON.parse(cached));
//     }

//     const taxPayer = await OnBoardingModel
//       .findOne({ _id })
//       .populate({ path: "userId", select: "email" })
//       .lean();

//     if (!taxPayer) {
//       return response.status(400).json({
//         success: false,
//         message: "tax payer hasn't onboarded yet"
//       });
//     }

//     if (taxPayer.userId._id.toString() !== userId) {
//       return response.status(403).json({
//         success: false,
//         message: "Unauthorized"
//       });
//     }

//     const responsePayload = {
//       success: true,
//       message: `${taxPayer.userId.email} onboarding profile`,
//       profile: taxPayer
//     };

//     await redis.setEx(cacheKey, 3600, JSON.stringify(responsePayload));

//     return response.status(200).json(responsePayload);

//   } catch (error) {
//     console.error(error);
//     return response.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// };

export const viewOnboard = async (req, res) => {
  const { _id } = req.query;
  const { userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid profile ID"
    });
  }

  try {
    // 1️⃣ Check cache first
    const cacheKey = `onboard:profile:${userId}:${_id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[Redis] HIT ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    // 2️⃣ Fetch from DB
    const taxPayer = await OnBoardingModel
      .findOne({ _id })
      .populate({ path: "userId", select: "email" })
      .lean();

    if (!taxPayer) {
      return res.status(400).json({
        success: false,
        message: "Tax payer hasn't onboarded yet"
      });
    }

    // 3️⃣ Ownership check
    if (taxPayer.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    // 4️⃣ Build response
    const responsePayload = {
      success: true,
      message: `${taxPayer.userId.email} onboarding profile`,
      profile: taxPayer
    };

    // 5️⃣ Cache the response for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(responsePayload));

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// export const updateOnboard = withTransaction(async (req, res) => {
//   const session = req.mongoSession;
//   const { _id } = req.query;
//   const { userId } = req.user;
//   const input = req.body;

//   // 1️⃣ Validate input
//   const { error, value } = onBoardingSchema.validate({
//     userId,
//     ...input
//   });

//   if (error) {
//     throw new Error(error.details[0].message);
//   }

//   // 2️⃣ Find profile with session
//   const existingProfile = await OnBoardingModel.findById(_id).session(session);

//   if (!existingProfile) {
//     throw new Error("Onboarding profile not found. Please create one first.");
//   }

//   // 3️⃣ Ownership check
//   if (existingProfile.userId.toString() !== userId) {
//     throw new Error("Unauthorized: You do not own this profile.");
//   }

//   // 4️⃣ Update allowed fields (exclude userId)
//   const updatableFields = [
//     "role",
//     "saIdNumber",
//     "sarsTaxNumber",
//     "vatNumber",
//     "businessStructure",
//     "financialYearEnd",
//     "estimatedAnnualIncome",
//     "managedTaxes",
//     "accountingIntegration",
//     "taxYear",
//     "audit",
//   ];

//   updatableFields.forEach((field) => {
//     if (value[field] !== undefined) {
//       existingProfile[field] = value[field];
//     }
//   });

//   // 5️⃣ Save with session
//   const updatedProfile = await existingProfile.save({ session });

//   // 6️⃣ Return response
//   res.status(200).json({
//     success: true,
//     message: "Profile updated successfully.",
//     updated_Profile: updatedProfile,
//   });
// });

// export const deleteOnboard = withTransaction( async (request, response) => {
//     const session = request.mongoSession;
//     const {_id} = request.query;
//     try {
//         const existingOnboardProfile = await OnBoardingModel.findOne({_id}).session(session)
//         if (!existingOnboardProfile) {
//             await session.abortTransaction();
//             return response.status(404).json({
//                 success: false,
//                 message: "User doesn't have an onboard profile, create one!"
//             })
//         }
//         /** */
//         if (existingProfile.userId.toString() !== userId) {
//             await session.abortTransaction();
//             return response.status(403).json({
//               success: false,
//               message: "Unauthorized to delete this onboard profile"
//             })
//         } else if (existingProfile.userId.toString() !== userId.toString()) {
//           await OnBoardingModel.deleteOne({_id})
//           response.status(201).json({
//             success: true,
//             message: "Profile delete successfully"
//           })
//         }
        
//     } catch(error) {
//         return response.status(500).json({
//             success: false,
//             field: null,
//             message: error.details[0].message
//         })
//     }
// });

export const updateOnboard = withTransaction(async (req, res) => {
  const session = req.mongoSession;
  const { _id } = req.query;
  const { userId } = req.user;
  const input = req.body;

  // 1️⃣ Validate input
  const { error, value } = onBoardingSchema.validate(
    { userId, ...input },
    { abortEarly: false }
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }

  const {
    role,
    saIdNumber,
    sarsTaxNumber,
    vatNumber,
    businessStructure,
    financialYearEnd,
    estimatedAnnualIncome,
    managedTaxes,
    accountingIntegration,
    taxYear,
    audit,
  } = value;

  // 2️⃣ Find profile with session
  const existingProfile = await OnBoardingModel.findById(_id).session(session);
  if (!existingProfile) {
    return res.status(404).json({
      success: false,
      message: "Onboarding profile not found. Please create one first.",
    });
  }

  // 3️⃣ Ownership check
  if (existingProfile.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: You do not own this profile.",
    });
  }

  // 4️⃣ Hash SARS Tax number if updated
  let hashedTaxNumber = existingProfile.sarsTaxNumber;
  if (sarsTaxNumber && sarsTaxNumber !== existingProfile.sarsTaxNumber) {
    hashedTaxNumber = await doHash(sarsTaxNumber, 10);
  }

  // 5️⃣ Auto-assign managed taxes if not provided
  let finalManagedTaxes = managedTaxes && managedTaxes.length > 0
    ? managedTaxes
    : existingProfile.managedTaxes;
  if (!finalManagedTaxes || finalManagedTaxes.length === 0) {
    if (role === "tax_payer" && businessStructure === "individual") finalManagedTaxes = ["ITR12"];
    if (role === "tax_payer" && businessStructure === "trust") finalManagedTaxes = ["ITR14"];
    if (role === "business" || businessStructure === "pty_ltd") finalManagedTaxes = ["VAT201"];
  }

  // 6️⃣ Update audit log
  const auditLog = {
    ...existingProfile.audit,
    action: "update_onboarding",
    performedBy: userId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || "unknown",
    timestamp: new Date(),
    ...audit,
  };

  // 7️⃣ Update allowed fields
  const updatableFields = {
    role,
    saIdNumber,
    sarsTaxNumber: hashedTaxNumber,
    vatNumber,
    businessStructure,
    financialYearEnd,
    estimatedAnnualIncome,
    managedTaxes: finalManagedTaxes,
    accountingIntegration,
    taxYear,
    audit: auditLog,
  };

  Object.keys(updatableFields).forEach((key) => {
    if (updatableFields[key] !== undefined) {
      existingProfile[key] = updatableFields[key];
    }
  });

  // 8️⃣ Save with session
  const updatedProfile = await existingProfile.save({ session });

  // 9️⃣ Return response
  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    updated_Profile: updatedProfile,
  });
});

export const deleteOnboard = withTransaction(async (req, res) => {
  const session = req.mongoSession;
  const { _id } = req.query;
  const { userId } = req.user;

  // 1️⃣ Find profile with session
  const existingProfile = await OnBoardingModel.findById(_id).session(session);

  if (!existingProfile) {
    throw new Error("User doesn't have an onboard profile. Create one first.");
  }

  // 2️⃣ Check ownership
  if (existingProfile.userId.toString() !== userId) {
    throw new Error("Unauthorized to delete this onboard profile.");
  }

  // 3️⃣ Delete with session
  await OnBoardingModel.deleteOne({ _id }).session(session);

  // 4️⃣ Return response
  res.status(200).json({
    success: true,
    message: "Profile deleted successfully",
  });
});

