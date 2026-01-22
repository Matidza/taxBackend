import mongoose from "mongoose";

const TaxDetailSchema = new mongoose.Schema({
    tax_number: {
        type: String, required: true,
        unique: true,maxlength: 8, minlegth: 8
    },
    ID_Number: {
        type: Number,
        required: true, unique: true,
        maxlength: 13, minlegth: 13
    },
    type: {type: String, enum: ["administrator", "tax payer", "tax practitionor"]},
    title: {type: String, required: true},
    description: {type: String, required: false},
    propertyType: {type: String, required: false},
    location: {type: Number, required: false},
    salary: {type: String, required: false},
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserModel', required: true 
    },
})

const OnBoardingModel = mongoose.model('OnBoardingModel', TaxDetailSchema)
export default OnBoardingModel 