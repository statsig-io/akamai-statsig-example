import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy-assets";
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default {
  input: "main.ts",
  external: ["log"],
  output: {
    format: "es",
    dir: "built",
    preserveModules: true,
  },
  plugins: [
    typescript(),
    json(),
    //Converts CommonJS modules to ES6 modules.
    commonjs(),
    //Helps Rollup resolve modules from the node_modules directory.
    resolve(),
    //Copies bundle.json to the output directory
    copy({
      assets: ["./bundle.json"],
    }),
  ],
};
