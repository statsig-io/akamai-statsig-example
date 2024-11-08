## Statsig Akamai EdgeKV Example

An example repo showing how to integration Statsig in your EdgeWorker using EdgeKV

## Pre-requisite
(TODO: link to Statstig Akamai EdgeKV integration docs)

## Getting Started

You can either clone this repo or apply the necessary changes to your existing EdgeWorker code bundle.

### Clone Repo

1. Clone this repo `gh repo clone statsig-io/akamai-statsig-example`
2. Replace the EdgeKV access tokens in `edgekv_tokens.js` with your own. (See how https://techdocs.akamai.com/edgekv/docs/generate-and-retrieve-edgekv-access-tokens) **_Ensure that your namespace is prefixed with `namespace-`_
3. Replace the Statsig [server secret key](https://docs.statsig.com/sdk-keys/api-keys/#server-secret-keys) with your own.
4. Replace the company ID with your own. (You can find this in the Statsig Console URL `https://console.statsig.com/<COMPANY_ID>`
5. Rename the placeholder experiment `akamai_edge_ab_test` and swap out the parameter `variant` with your own.

### Existing Repo
1. Install the Statsig SDK for Akamai Edge `npm install statsig-akamai-edge`
2. Polyfill Node.JS `crypto` with Akamai Edge built-in `crypto` (Used by Statsig SDK to generate a unique session ID)
```js
import { crypto } from "crypto";

globalThis.crypto = { getRandomValues: crypto.getRandomValues };
```
3. If using [rollup](https://rollupjs.org/), copy the file `rollup-plugin-edgekv.js` and include in your `rollup.config.js`. This preserves the original `edgekv.js` file (no minify) which Akamai relies on for static validation.
```js
import edgekv from "./rollup-plugin-edgekv.js";

export default {
  ...
  plugins: [
    ...,
    edgekv(),
  ],
```
4. Initialize the Statsig SDK
```js
import {Statsig, EdgeKVAdapter} from "statsig-akamai-edge";
import { edgekv_access_tokens } from "./edgekv_tokens.js";

export async function responseProvider(request: EW.ResponseProviderRequest) {
  await Statsig.initialize("secret-****",
    {
      dataAdapter: new EdgeKVAdapter({
        namespace: "default",
        companyID: "<YOUR_COMPANY_ID>",
        edgekv_access_tokens: edgekv_access_tokens,
      }),
      environment: {tier: "development"},
    }
  )
}
```
5. Evaluate the experiment
```js
const user = {userID: '123'}
const experiment = Statsig.getExperimentSync(user, "akamai_edge_ab_test");
const variant = experiment.get("variant", "default");
```

### Further Details
1. How to implement sticky bucketing using Cookies https://www.akamai.com/blog/developers/better-a-b-testing-with-edgeworkes-edgekv
2. Akamai EdgeWorkers only support network subrequests to within their network (Akamai domain). So in order to log events to Statsig, you will need to configure a proxy for `https://api.statsig.com` and overrider the `api` field when initializing `Statsig`
