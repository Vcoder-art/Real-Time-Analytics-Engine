const crypto = require("crypto");
const ApiKeyModel = require("../models/api.key.model");
const CompanyModel = require("../models/company.model");


async function createApiKey(req, res) {
  try {
    const { appName } = req.body;
    
    if (!appName) {
      return res.status(400).json({ msg: "appName is required" });
    }

    let existingApp = await ApiKeyModel.findOne({appName})

    if(existingApp) {
      return res.status(400).json({msg:"This app name already occupied."})
    }


    // backend generates a unique, non-guessable appId
    const appId = `app_${crypto.randomBytes(8).toString("hex")}`;
    const key = ApiKeyModel.generateKey("pk_");

    const apiKey = await ApiKeyModel.create({
      key,
      appId,
      appName,
      company: req.companyId,
    });   

    await CompanyModel.findByIdAndUpdate(req.companyId,{
      $push:{apiKeys: apiKey._id}
    })

    res.status(201).json({
      success: true,
      apiKey: apiKey.key,
      appId: apiKey.appId,
      appName: apiKey.appName,
    });
  } catch (err) {
    console.error("API key creation failed:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
}


async function revokeApiKey(req, res) {
  try {
    const apiKey = await ApiKeyModel.findOne({
      key: req.params.key,
      company: req.companyId,
    });

    if (!apiKey) return res.status(404).json({ msg: "API key not found" });

    await apiKey.revoke();
    res.json({ success: true, msg: "API key revoked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
}

module.exports = { createApiKey, revokeApiKey };
