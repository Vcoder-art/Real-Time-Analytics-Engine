const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

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
    password: {
      type: String,
      required: true,
      minlength: 6,
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


// 🔒 Hash password before save
companySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
companySchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const CompanyModel = mongoose.model("Company", companySchema);
module.exports = CompanyModel