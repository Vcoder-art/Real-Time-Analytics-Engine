const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(process.cwd(), "..", "proto-contract", "analytics.proto");

const packageDefinition  = protoLoader.loadSync(PROTO_PATH,{
    keepCase:true,
    longs:String,
    enums:String,
    defaults:true,
    oneofs:true
})

const analyticsProto = grpc.loadPackageDefinition(packageDefinition).analytics;

const analyticsClient = new analyticsProto.AnalyticsService(
    "127.0.0.1:50051",
    grpc.credentials.createInsecure()
)

module.exports = {analyticsClient}
