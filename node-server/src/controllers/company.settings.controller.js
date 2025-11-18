const CompanyModel = require("../models/company.settings.model");

const getCompanySettings = async (req, res) => {
  try {
    const settings = await CompanyModel.findOne({ companyId: req.companyId });
    const payload = {
      msg: "Fetch settings successfully.",
      success: true,
      data: {
        settings,
      },
    };
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: "Failed to get settings." });
  }
};

const settingUpdate = async (req, res) => {
  try {
    const {updates } = req.body;
    const companyId = req.companyId;

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({
        success: false,
        msg: "updates object is required",
      });
    }

    // ----------------------------
    // Whitelist allowed update fields
    // ----------------------------
    const allowedFields = [
      "retentionDays",
      "realtimeEnabled",
      "realtimeIntervalMS",
      "allowedDomains",
      "autoPurge",
      "webhookUrl",
      "emailAlerts",
    ];

    const sanitizedUpdates = {};

    for (let key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No valid fields to update",
      });
    }

    const settings = await CompanyModel.findOneAndUpdate(
      { companyId },
      {
        $set: sanitizedUpdates,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.json({
      success: true,
      msg: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};

module.exports = { getCompanySettings,settingUpdate };
