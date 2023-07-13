const { relative } = require("path");

const cwd = process.argv[2];
const targetPath = process.argv[3];
const rel = relative(cwd, targetPath);
if (rel.startsWith("..")) {
  console.log(`${targetPath} tries to escape ${cwd}`);
  process.exit(0);
}
