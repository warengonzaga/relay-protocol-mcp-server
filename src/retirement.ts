export const RETIREMENT_NOTICE =
  "This community MCP server has been discontinued. Relay Protocol is not discontinued. Its API is changing, and responses are no longer publicly available outside the authorized integration scope. Relay's team has its own MCP server. Read Relay's Requests v3 migration guide: https://docs.relay.link/references/api/api_guides/migrating-to-requests-v3";

export const retirementStatusTool = {
  name: "relay_project_status",
  description:
    "Explain the discontinued status of this community server and link to Relay's API migration guide.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};

export function createRetirementStatusResult() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            project: "Relay Protocol MCP Server",
            status: "discontinued",
            message: RETIREMENT_NOTICE,
            migrationGuide:
              "https://docs.relay.link/references/api/api_guides/migrating-to-requests-v3",
          },
          null,
          2,
        ),
      },
    ],
  };
}
