const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Types.ObjectId,
    ref: "Company",
    required: true,
    unique: true,
  },

  // analytics retention days
  retention_days: {
    type: Number,
    default: 30,
  },

  // websocket live updates ON/OFF
  realtime_enabled: {
    type: Boolean,
    default: true,
  },

  realtime_interval_ms: {
    type: Number,
    default: 100,
  },

  allowed_domains: {
    type: [String],
    default: [],
  },

  auto_purge: {
    type: Boolean,
    default: false,
  },

  webhook_url: {
    type: String,
    default: null,
  },

    email_alerts: {
    type: Boolean,
    default: false
  }
},{timestamps:true});

module.exports = mongoose.model("CompanySetting", companySettingsSchema);
