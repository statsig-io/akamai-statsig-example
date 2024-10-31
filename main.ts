import { createResponse } from "create-response";
import {
  Statsig,
  StatsigUser,
  EdgeKVAdapter,
  InitializationDetails,
} from "statsig-akamai-edge";
import logger from "./logger";
import { crypto } from "crypto";
import { edgekv_access_tokens } from "./edgekv_tokens.js";

// The dependency uuid expects crypto to be defined on global
// The built-in crypto module provided by Akamai EdgeWorker is 1. a named export and 2. not defined globally
// As a result, crypto must be polyfilled manually with the following
// @ts-ignore
globalThis.crypto = { getRandomValues: crypto.getRandomValues };

let statsigPromise: Promise<InitializationDetails> | undefined = undefined;

export async function responseProvider(request: EW.ResponseProviderRequest) {
  logger.debug("Handling request...");
  try {
    if (!statsigPromise) {
      statsigPromise = Statsig.initialize("secret-****", {
        dataAdapter: new EdgeKVAdapter({
          namespace: "default",
          companyID: "<YOUR_COMPANY_ID>",
          edgekv_access_tokens: edgekv_access_tokens,
        }),
        logger: logger,
        environment: {
          tier: "development",
        },
      });
      const initializeDetails = await statsigPromise;
      logger.debug(
        `Statsig initialized ${JSON.stringify(initializeDetails, undefined, 2)}`
      );
    } else {
      logger.debug("Statsig already initialized");
    }

    const user: StatsigUser = {
      userID: String(request.getHeader("user-id")?.[0] ?? "unknown"),
      ip: request.clientIp,
    };

    logger.debug(`User ID: ${user.userID}`);

    const experiment = Statsig.getExperimentSync(user, "akamai_edge_ab_test");
    const variant = experiment.get("variant", "default");

    logger.debug(`Group Name: ${experiment.getGroupName()}`);
    logger.debug(`Variant: ${variant}`);

    const response = logger.getLogs().join("\n");
    logger.clearLogs();

    // Send Response
    return createResponse(200, {}, response);
  } catch (e) {
    const response = `${logger
      .getLogs()
      .join("\n")}Error occurred: ${e.toString()}`;
    logger.clearLogs();
    return createResponse(500, {}, response);
  }
}
