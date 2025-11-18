const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },

    // analytics retention days
    retentionDays: {
      type: Number,
      default: 30,
    },

    // websocket live updates ON/OFF
    realtimeEnabled: {
      type: Boolean,
      default: true,
    },

    realtimeIntervalMS: {
      type: Number,
      default: 100,
    },

    allowedDomains: {
      type: [String],
      default: [],
    },

    autoPurge: {
      type: Boolean,
      default: false,
    },

    webhookUrl: {
      type: String,
      default: null,
    },

    emailAlerts: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanySetting", companySettingsSchema);
