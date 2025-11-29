const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")


const EmployeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6 },
    email: { type: String, required: true, index: true },
    name: { type: String },
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    userId: { type: String }, // analytics userId
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

EmployeeSchema.index({ companyId: 1, email: 1 }, { unique: true });

// 🔒 Hash password before save
EmployeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
EmployeeSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", EmployeeSchema);
