import UserModel from "../models/UserModel.js";
import OnBoardingModel from "../models/UserOnboarding.js";
import { onBoardingSchema } from "../middlewares/validateUsertaxDetails.js";

export const onBoarding = async (req, res) => {
  const userId = req.user._id; // from JWT
  const {
    taxpayerType,
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
  } = req.body;

  try {
    // 1️⃣ Validate input
    const { error, value } = onBoardingSchema.validate({
      user: userId,
      taxpayerType,
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
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // 2️⃣ Check if profile already exists for this tax year
    const existingProfile = await OnBoardingModel.findOne({
      user: userId,
      taxYear,
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "You already have an onboarding profile for this tax year.",
      });
    }

    // 3️⃣ Create profile
    const newProfile = await OnBoardingModel.create({
      user: userId,
      taxpayerType,
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
    });

    // 4️⃣ Update User type if needed
    const user = await UserModel.findById(userId);
    if (user && user.type !== taxpayerType) {
      user.type = taxpayerType;
      await user.save();
    }

    return res.status(201).json({
      success: true,
      message: "Onboarding completed successfully",
      result: newProfile,
    });
  } catch (err) {
    console.error("Onboarding error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again",
    });
  }
};


export const viewOnboard = async (request, response) => {
    const {_Id} = request.query;

    try {
        const taxPayer = await OnBoardingModel.findOne({_Id})
        /** .populate({
            path: "userId",
            select: "email"
        })*/

        if (!taxPayer) {
            return response.status(400).json({
                success: false,
                message: "tax payer hasn't onboarded yet, please do!! "
            })
        }

        response.status(200).json({
            success: true,
            message: "onboarding profile",
            profile: taxPayer
        })
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

export const updateOnboard = async (request, response) => {
    const {_Id} = request.query;
    const { name, surname, currentJobTitle, companyName, description } = request.body;
    const { userId } = request.user; // ✅ Comes from JWT payload

    try{
        const {value, error } = onBoardingSchema.validate({
             name, surname, currentJobTitle, companyName, description, userId
        })
        if (error) {
            return response.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const existingOnboardProfile = await OnBoardingModel.findOne({_Id})
        if (!existingOnboardProfile) {
            return response.status(404).json({
                success: false,
                message: "Profile doesn't exist, create one !"
            });
        }
        /** */
        if (existingOnboardProfile.userId.toString() !== userId) {
             return response.status(403).json({
                success: false,
                message: "Unauthorized, login is required!"
            });
        }
        existingOnboardProfile.name = name;
        existingOnboardProfile.surname = surname;
        existingOnboardProfile.currentJobTitle = currentJobTitle;
        existingOnboardProfile.companyName = companyName;
        existingOnboardProfile.description = description;

        const updatedProfile = await existingOnboardProfile.save()

        response.status(200).json({
            success: true,
            message: "Profile was updated!",
            updatedProfile: updatedProfile,
        })


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

export const deleteOnboard = async (request, response) => {
    const {_Id} = request.query;
    try {
        const existingOnboardProfile = await OnBoardingModel.findOne({_Id})
        if (!existingOnboardProfile) {
            return response.status(404).json({
                success: false,
                message: "User didn't onboard, please do!"
            })
        }
        /** 
        if (existingProfile.userId.toString() !== userId) {
            return response.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        }*/
        await OnBoardingModel.deleteOne({_Id})
        response.status(201).json({
            success: true,
            message: "Profile delete successfully"
        })
    } catch(error) {
        return response.status(500).json({
            success: false,
            field: null,
            message: error.details[0].message
        })
    }
}