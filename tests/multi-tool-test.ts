/**
 * Multi-tool integration test — prompt requiring two distinct tools.
 * Uses math + base64 (both work locally without external APIs).
 */

import {
  createDaisiClient,
  nodeTransportFactory,
  ThinkLevels,
  InferenceResponseTypes,
} from "../src/index";

const ORC_ADDRESS = "localhost";
const ORC_PORT = 5000;
const ORC_USE_SSL = false;
const SECRET_KEY = process.env.DAISI_SECRET_KEY || "secret-fadowqiwawfjytaccnsp";

const TypeName: Record<number, string> = {
  [InferenceResponseTypes.InferenceResponseTypesError]: "Error",
  [InferenceResponseTypes.InferenceResponseTypesThinking]: "Thinking",
  [InferenceResponseTypes.InferenceResponseTypesTooling]: "Tooling",
  [InferenceResponseTypes.InferenceResponseTypesToolContent]: "ToolContent",
  [InferenceResponseTypes.InferenceResponseTypesText]: "Text",
  [InferenceResponseTypes.InferenceResponseTypesImage]: "Image",
};

async function main() {
  console.log("Connecting to local ORC...");

  const client = await createDaisiClient({
    transportFactory: nodeTransportFactory,
    secretKey: SECRET_KEY,
    orcAddress: ORC_ADDRESS,
    orcPort: ORC_PORT,
    orcUseSsl: ORC_USE_SSL,
  });

  console.log("Client created.\n");

  console.log("=== Multi-Tool: Math + Base64 ===");
  {
    const inference = client.inference.create();
    await inference.sessionManager.negotiateSession();
    console.log("Session negotiated.\n");

    const toolsUsed: string[] = [];
    let toolContentCount = 0;
    let textContent = "";

    for await (const token of inference.send(
      "I need two things: 1) List all the files in the C:\\GGUFs directory. 2) Tell me the current date and time including seconds. Use the appropriate tools for each task.",
      ThinkLevels.ThinkLevelsBasicWithTools,
    )) {
      const typeName = TypeName[token.Type] ?? `Unknown(${token.Type})`;
      const preview = (token.Content ?? "").substring(0, 150).replace(/\n/g, "\\n");
      console.log(`  [${typeName}] ${preview}`);

      if (token.Type === InferenceResponseTypes.InferenceResponseTypesTooling) {
        const match = (token.Content ?? "").match(/Using tool\.\.\. (.+)/);
        if (match) toolsUsed.push(match[1]);
      }
      if (token.Type === InferenceResponseTypes.InferenceResponseTypesToolContent) toolContentCount++;
      if (token.Type === InferenceResponseTypes.InferenceResponseTypesText) {
        textContent += token.Content ?? "";
      }
    }

    console.log(`\n--- Results ---`);
    console.log(`Tools used: [${toolsUsed.join(", ")}]`);
    console.log(`ToolContent messages: ${toolContentCount}`);
    console.log(`Text response: ${textContent.substring(0, 400).trim()}`);

    if (toolsUsed.length >= 2) {
      console.log(`\nMULTI-TOOL: YES (${toolsUsed.length} tools)`);
    } else {
      console.log(`\nMULTI-TOOL: NO (only ${toolsUsed.length} tool${toolsUsed.length === 1 ? "" : "s"})`);
    }

    await inference.close();
  }

  console.log("\n=== DONE ===");
}

main().catch((err) => {
  console.error("Fatal:", err.message ?? err);
  process.exit(1);
});
