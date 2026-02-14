/**
 * DAISI Node.js Chat — Interactive CLI
 *
 * A readline-based chat that streams inference responses token-by-token.
 *
 * Usage:
 *   DAISI_SECRET_KEY=sk-... npx tsx index.ts
 *   DAISI_CLIENT_KEY=ck-... npx tsx index.ts
 */

import * as readline from "readline";
import {
  createDaisiClient,
  nodeTransportFactory,
  createDefaultSendInferenceRequest,
  getLastMessageTokensPerSecond,
  getSessionTokensPerSecond,
  ThinkLevels,
} from "@daisi/sdk";

async function main() {
  const secretKey = process.env.DAISI_SECRET_KEY;
  const clientKey = process.env.DAISI_CLIENT_KEY;

  if (!secretKey && !clientKey) {
    console.error(
      "Set DAISI_SECRET_KEY or DAISI_CLIENT_KEY environment variable.",
    );
    process.exit(1);
  }

  console.log("Connecting to DAISI network...");

  const client = await createDaisiClient({
    transportFactory: nodeTransportFactory,
    secretKey,
    clientKey,
  });

  console.log("Creating inference session...");

  const inference = client.inference.create();
  await inference.sessionManager.negotiateSession();

  console.log("Ready! Type your messages (Ctrl+C to quit).\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("You: ", async (input) => {
      const text = input.trim();
      if (!text) {
        prompt();
        return;
      }

      process.stdout.write("AI: ");

      for await (const token of inference.send(text)) {
        if (token.Content) {
          process.stdout.write(token.Content);
        }
      }
      console.log();

      // Show token stats
      try {
        const stats = await inference.stats();
        const msgTps = getLastMessageTokensPerSecond(stats);
        const sesTps = getSessionTokensPerSecond(stats);
        console.log(
          `  [${msgTps.toFixed(1)} tok/s | session avg ${sesTps.toFixed(1)} tok/s]\n`,
        );
      } catch {
        console.log();
      }

      prompt();
    });
  };

  prompt();

  rl.on("close", async () => {
    console.log("\nClosing...");
    await inference.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal:", err.message ?? err);
  process.exit(1);
});
