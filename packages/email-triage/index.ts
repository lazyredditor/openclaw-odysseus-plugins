import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { ConfigSchema, type Config } from "./src/config.js";
import { registerTools } from "./src/tools.js";

export default definePluginEntry({
  id: "email-triage",
  name: "Email Triage",
  description: "Triage unread email: urgency, tags, spam, summaries, and draft replies.",
  // TypeBox schemas are JSON Schema; wrap as the plugin config-schema contract.
  configSchema: { jsonSchema: ConfigSchema as any },
  register(api) {
    registerTools(api, (api.pluginConfig ?? { accounts: [] }) as Config);
  },
});
