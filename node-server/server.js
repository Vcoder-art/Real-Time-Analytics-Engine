const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./src/routes");
const { WebSocketGateway } = require("./src/ws/wsServer");
const {redisHelper} = require("./src/utils/redis-helper")
const path = require("path")
const http = require("http");

const app = express();
const server = http.createServer(app);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log(__dirname)


// Initialize WebSocket gateway
new WebSocketGateway(server,redisHelper);

dotenv.config();
app.use(cors());
app.use(express.json()); // important: parse JSON body

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ msg: "Node server started" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    server.listen(4000, () => {
      console.log("✅ Server started on port 4000");
    });
  })
  .catch((err) => console.error("MongoDB Error:", err));
