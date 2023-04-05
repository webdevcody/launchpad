const serverlessExpress = require("@vendia/serverless-express");
const { app } = require("./src");
console.log("we are here");
console.log("app", app);
exports.handler = serverlessExpress({ app });
