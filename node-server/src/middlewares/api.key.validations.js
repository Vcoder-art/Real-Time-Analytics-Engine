const ApiKeyModel = require("../models/api.key.model")

const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key") || req.body.apiKey;
    if (!apiKey) return res.status(401).json({ message: "Missing API key" });

    const keyDoc = await ApiKeyModel.findOne({ key: apiKey, revoked: false }).populate("company");
    if (!keyDoc) return res.status(403).json({ message: "Invalid API key" });

    // attach metadata for later use
    req.apiKeyDoc = keyDoc;
    req.company = keyDoc.company;
    // update lastUsedAt asynchronously (best effort)
    ApiKeyModel.updateOne({ _id: keyDoc._id }, { $set: { lastUsedAt: new Date() } }).exec();

    next();
  } catch (err) {
    next(err);
  }
};


module.exports = validateApiKey;