import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const source = await readFile(new URL("../../../D_Display/platform/shell.mjs", import.meta.url), "utf8");
const styles = await Promise.all(["site.css", "layout.css"].map(name => readFile(new URL(`../../../D_Display/platform/${name}`, import.meta.url), "utf8")));

test("public Canvas shell does not render internal module mount telemetry", () => {
  assert.doesNotMatch([source, ...styles].join("\n"), /runtime-status|modules mounted|module .*gắn|role','status/i);
});
