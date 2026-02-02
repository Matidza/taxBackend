import OnBoardingModel from "../models/onBoardingModel.js";



export const dashboard = async (request, response) => {
    const {_id} = request.query;
    const { userId } = request.user; // ✅ Comes from JWT payload

    try {
        const taxPayer = await OnBoardingModel.findOne({_id})
          .populate({ path: "userId", select: "email" })

        if (!taxPayer) {
            return response.status(400).json({
                success: false,
                message: "tax payer hasn't onboarded yet, please do!! "
            })
        }
        if (taxPayer.userId._id.toString() !== userId) {
          console.log(userId)
          console.log(taxPayer.userId._id)
          return response.status(403).json({
            success: false,
            message: "Unauthorized, profile doesn't belong to user.Please login to your account"
          });
        } else if (taxPayer.userId._id.toString() === userId) {
          response.status(200).json({
              success: true,
              message: `${taxPayer.userId.email} onboarding profile`,
              profile: taxPayer
          })
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