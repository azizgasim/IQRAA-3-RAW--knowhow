import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "memory");

export function readLocal(name: string) {
  const file = path.join(ROOT, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function writeLocal(name: string, data: any) {
  const file = path.join(ROOT, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}
