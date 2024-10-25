import * as fs from "fs-extra";
import path from "path";

// Rollup plugin to preserve the original edgekv.js helper file
// Necessary for maintaining the file structure used by the EdgeWorker validator
export default function edgekvPlugin() {
  return {
    name: "rollup-plugin-edgekv",
    resolveId(source) {
      if (source === "./edgekv.js") {
        // this signals that Rollup should not ask other plugins or check
        // the file system to find this id
        return source;
      }
      return null; // other ids should be handled as usually
    },
    async generateBundle({ file, dir }) {
      const outputDirectory = dir || path.dirname(file);
      const target = path.join(outputDirectory, "./edgekv.js");
      return await fs.copy("./edgekv.js", target, {
        overwrite: true,
        errorOnExist: false,
      });
    },
  };
}
