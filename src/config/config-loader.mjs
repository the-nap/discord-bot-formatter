import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV === "prod" ? "prod" : "dev";
const configPath = path.join(__dirname, `config.${env}.json`);

if (!fs.existsSync(configPath)) {
  throw new Error(`Missing config file: ${configPath}`);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

export default config;
