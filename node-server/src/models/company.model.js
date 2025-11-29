const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    apiKeys: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ApiKey", // reference for later
      },
    ],
  },
  { timestamps: true }
);




const CompanyModel = mongoose.model("Company", companySchema);
module.exports = CompanyModel