import { createResponse } from "create-response";
import { EdgeKV } from "./edgekv.js";
import { StatsigServer } from "statsig-node-edge";
import { logger } from "log";
import { crypto } from "crypto";

// The dependency uuid expects crypto to be defined on global
// The built-in crypto module provided by Akamai EdgeWorker is 1. a named export and 2. not defined on global
// As a result, crypto is not automatically polyfilled.
// This manually imports crypto and defines it on global
// @ts-ignore
globalThis.crypto = { getRandomValues: crypto.getRandomValues };

export async function responseProvider(request: EW.ResponseProviderRequest) {
  try {
    // Set Up EdgeKV
    const edgeKv = new EdgeKV({
      namespace: "default",
      group: "statsig-6cDiX6GUGEP7UVsN7khs5W",
    });
    logger.debug("EdgeKV Initialized");

    const configSpecs = await edgeKv.getJson({ item: "config-specs" });
    logger.debug(`Config specs: ${configSpecs}`);

    // Set up Statsig SDK
    const statsig = new StatsigServer("secret-key", {
      bootstrapValues: configSpecs,
    });
    await statsig.initializeAsync();
    logger.debug("Statsig Initialized");

    const experiment = statsig.getExperimentSync(
      { userID: request.getHeader("user-id")[0], ip: request.clientIp },
      "akamai_edge_ab_test"
    );

    const variant = experiment.get("variant", "default");
    logger.debug(`Received variant ${variant}`);

    // Send Response
    return createResponse(200, {}, variant);
  } catch (e) {
    return createResponse(200, {}, `Error occurred: ${e.toString()}`);
  }
}
