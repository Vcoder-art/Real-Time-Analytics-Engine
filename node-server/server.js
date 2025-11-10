const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./src/routes");
const app = express();


dotenv.config();
app.use(cors());
app.use(express.json()); // important: parse JSON body

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ msg: "Demo server started" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(4000, () => {
      console.log("✅ Server started on port 4000");
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
