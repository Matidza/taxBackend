import UserModel from "../models/userModel.js";
import OnBoardingModel from "../models/onBoardingModel.js";
import  {onBoardingSchema} from "../middlewares/validateUsertaxDetails.js"


export const onBoarding = async ( request, response) => {
    const { title, type, tax_number } = request.body;
    const { userId} = request.user; // ✅ Comes from JWT payload
    const { _id} = request.query;
    
    try {
        // 1. Validate fields
        const { value, error } = onBoardingSchema.validate({
            title, type,
            userId, tax_number
        });
    
        if (error) {
            return response.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }
        // 2. Check if user is a mentor
        /**  
        if (user_type !== "mentor") {
            return response.status(403).json({
                success: false,
                message: "Only mentors are allowed to create a profile."
            });
        }*/

        // 3. Check if mentor already has a profile
        const existingProfile = await OnBoardingModel.findOne({ userId });
        if (existingProfile) {
            return response.status(400).json({
                success: false,
                message: "You already have a profile. You can only create one."
            });
        }

        // 4. Create profile
        const newProfile = await OnBoardingModel.create({
            userId,title, type, tax_number
        });
        // const result = new newProfile.save()

        // // Udate the UserModel.type field after onbarding
        // const userType = result.type
        // const userProfile = await UserModel.findOne({ _id })
        // if ( userType === userProfile ) {
        //     userProfile.type = type
        //     updateProfile = await userProfile.save()
        // }

        return response.status(201).json({
            success: true,
            message: "Onboarding completed successfully.",
            // update: `UserModel: type field was updated with ${updateProfile}`,
            result: newProfile
        });

    } catch (error) {
        console.error("Error creating profile:", error);
        return response.status(500).json({
            success: false,
            message: error.details[0].message,
            messages: "Internal server error, please try again."
        });
    }
}

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