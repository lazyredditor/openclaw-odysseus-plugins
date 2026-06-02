import { Type } from "typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { textResult } from "openclaw/plugin-sdk/agent-runtime";

export default definePluginEntry({
  id: "email-triage",
  name: "Email Triage",
  description: "Triage unread email.",
  register(api) {
    api.registerTool({
      name: "triage_inbox",
      label: "Triage Inbox",
      description: "Scan unread email and return urgent items.",
      parameters: Type.Object({ accountId: Type.Optional(Type.String()) }),
      async execute() {
        return textResult("not implemented yet", undefined);
      },
    });
  },
});
