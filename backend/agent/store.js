import fs from "fs";
import path from "path";
const root = path.resolve(process.cwd(), "backend", "storage");
const load = (f) => JSON.parse(fs.readFileSync(path.join(root, f), "utf8"));
const save = (f, data) =>
  fs.writeFileSync(path.join(root, f), JSON.stringify(data, null, 2));

export function getState() {
  return load("state.json");
}
export function saveState(s) {
  return save("state.json", s);
}
export function getRules() {
  return load("rules.json");
}
export function saveRules(r) {
  return save("rules.json", r);
}
