import mongoose from "mongoose";

const TaxDetailSchema = new mongoose.Schema({
    
    type: {type: String, enum: ["administrator", "tax payer", "tax practitionor"]},
    title: {type: String, required: true},
    description: {type: String, required: false},
    propertyType: {type: String, required: false},
    location: {type: Number, required: false},
    price: {type: String, required: false},
    photo: {type: String, required: false},
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserModel', required: true 
    },
    onBoardingDetails: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'OnBoardingModel', required: true 
    },

})

const UserTaxDetails = mongoose.model('TaxDetails', TaxDetailSchema)
export default UserTaxDetails 