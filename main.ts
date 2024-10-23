import { createResponse } from "create-response";
import { EdgeKV } from "./edgekv.js";
import { Statsig } from "statsig-node-lite";
import { STATSIG_SDK_KEY } from "./secrets.js";

export async function responseProvider(request: EW.ResponseProviderRequest) {
  // Set Up EdgeKV
  const edgeKv = new EdgeKV({
    namespace: "default",
    group: "statsig-6cDiX6GUGEP7UVsN7khs5W",
  });

  const configSpecs = await edgeKv.getJson({ item: "config-specs" });

  // Set up Statsig SDK
  Statsig.initialize(STATSIG_SDK_KEY, {
    bootstrapValues: configSpecs,
  });

  const experiment = Statsig.getExperimentSync(
    { userID: request.getHeader("user-id")[0], ip: request.clientIp },
    "akamai_edge_ab_test"
  );

  const variant = experiment.get("variant", "default");

  // Send Response
  return createResponse(200, {}, variant);
}
