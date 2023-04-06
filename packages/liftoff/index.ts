import serverlessExpress from "@vendia/serverless-express";
import { app } from "./src";
exports.handler = serverlessExpress({ app });
