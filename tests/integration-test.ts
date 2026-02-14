/**
 * Integration test for inference fixes:
 * 1. Basic — should stream text response
 * 2. BasicWithTools — should return tool output + text response
 * 3. Skilled — should create session + return tool output + text response
 *
 * Usage: DAISI_SECRET_KEY=secret-... npx tsx tests/integration-test.ts
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

async function test(name: string, fn: () => Promise<void>) {
  process.stdout.write(`\n=== TEST: ${name} ===\n`);
  try {
    await fn();
    process.stdout.write(`--- PASS: ${name} ---\n`);
  } catch (err: any) {
    process.stdout.write(`--- FAIL: ${name} ---\n`);
    process.stdout.write(`Error: ${err.message ?? err}\n`);
    if (err.stack) process.stdout.write(`${err.stack}\n`);
  }
}

async function main() {
  console.log("Connecting to local ORC...");

  const client = await createDaisiClient({
    transportFactory: nodeTransportFactory,
    secretKey: SECRET_KEY,
    orcAddress: ORC_ADDRESS,
    orcPort: ORC_PORT,
    orcUseSsl: ORC_USE_SSL,
  });

  console.log("Client created, client key obtained.");

  // ---- Test 1: Basic Inference ----
  await test("Basic Inference", async () => {
    const inference = client.inference.create();
    await inference.sessionManager.negotiateSession();
    console.log("  Session negotiated.");

    let tokenCount = 0;
    let content = "";
    for await (const token of inference.send("What is 2+2? Reply in one sentence.", ThinkLevels.ThinkLevelsBasic)) {
      tokenCount++;
      if (token.Content) content += token.Content;
    }

    console.log(`  Tokens: ${tokenCount}, Content length: ${content.length}`);
    console.log(`  Response: ${content.substring(0, 300)}`);

    if (tokenCount === 0) throw new Error("No tokens received!");
    if (content.length === 0) throw new Error("Empty content!");

    await inference.close();
  });

  // ---- Test 2: BasicWithTools Inference ----
  await test("BasicWithTools Inference", async () => {
    const inference = client.inference.create();
    await inference.sessionManager.negotiateSession();
    console.log("  Session negotiated.");

    let hasTooling = false;
    let hasToolContent = false;
    let hasText = false;
    let textContent = "";
    let toolContent = "";

    for await (const token of inference.send("What is 2+2? Reply in one sentence.", ThinkLevels.ThinkLevelsBasicWithTools)) {
      const typeName = TypeName[token.Type] ?? `Unknown(${token.Type})`;
      const preview = (token.Content ?? "").substring(0, 120).replace(/\n/g, "\\n");
      console.log(`  [${typeName}] ${preview}`);

      if (token.Type === InferenceResponseTypes.InferenceResponseTypesTooling) hasTooling = true;
      if (token.Type === InferenceResponseTypes.InferenceResponseTypesToolContent) {
        hasToolContent = true;
        toolContent += token.Content ?? "";
      }
      if (token.Type === InferenceResponseTypes.InferenceResponseTypesText) {
        hasText = true;
        textContent += token.Content ?? "";
      }
    }

    console.log(`  hasTooling=${hasTooling}, hasToolContent=${hasToolContent}, hasText=${hasText}`);
    if (textContent) console.log(`  Text response: ${textContent.substring(0, 300)}`);

    if (!hasToolContent) throw new Error("No ToolContent received — tool result not forwarded to SDK!");
    if (!hasText) throw new Error("No Text response — model didn't generate an answer from tool output!");
    // Check text isn't just the anti-prompt
    const cleaned = textContent.replace(/\s+/g, "").replace(/User:/g, "");
    if (cleaned.length < 2) throw new Error(`Text response is just anti-prompt: "${textContent}"`);

    await inference.close();
  });

  // ---- Test 3: Skilled Create + Send ----
  await test("Skilled Create + Send", async () => {
    const inference = client.inference.create();
    await inference.sessionManager.negotiateSession();
    console.log("  Session negotiated.");

    const createResp = await inference.create({
      SessionId: inference.sessionManager.sessionId || "",
      ThinkLevel: ThinkLevels.ThinkLevelsSkilled,
    });

    console.log(`  InferenceId: ${createResp.InferenceId}`);
    if (!createResp.InferenceId) throw new Error("No InferenceId returned from Skilled Create!");

    let hasToolContent = false;
    let hasText = false;
    let textContent = "";

    for await (const token of inference.send("What is 2+2? Reply in one sentence.", ThinkLevels.ThinkLevelsSkilled)) {
      const typeName = TypeName[token.Type] ?? `Unknown(${token.Type})`;
      const preview = (token.Content ?? "").substring(0, 120).replace(/\n/g, "\\n");
      console.log(`  [${typeName}] ${preview}`);

      if (token.Type === InferenceResponseTypes.InferenceResponseTypesToolContent) hasToolContent = true;
      if (token.Type === InferenceResponseTypes.InferenceResponseTypesText) {
        hasText = true;
        textContent += token.Content ?? "";
      }
    }

    console.log(`  hasToolContent=${hasToolContent}, hasText=${hasText}`);
    if (textContent) console.log(`  Text response: ${textContent.substring(0, 300)}`);

    if (!hasText) throw new Error("No Text response for Skilled!");
    const cleaned = textContent.replace(/\s+/g, "").replace(/User:/g, "");
    if (cleaned.length < 2) throw new Error(`Text response is just anti-prompt: "${textContent}"`);

    await inference.close();
  });

  console.log("\n=== ALL TESTS COMPLETE ===");
}

main().catch((err) => {
  console.error("Fatal:", err.message ?? err);
  process.exit(1);
});
