/**
 * DAISI Node.js One-Shot — Single prompt, streamed to stdout
 *
 * The simplest possible usage: send one prompt, print the response, exit.
 *
 * Usage:
 *   DAISI_SECRET_KEY=sk-... npx tsx index.ts "What is the DAISI network?"
 *   DAISI_SECRET_KEY=sk-... npx tsx index.ts --skilled "Explain quantum entanglement"
 */

import {
  createDaisiClient,
  nodeTransportFactory,
  ThinkLevels,
} from "@daisi/sdk";

async function main() {
  const args = process.argv.slice(2);

  // Parse --skilled flag
  let thinkLevel = ThinkLevels.ThinkLevelsBasic;
  const skilledIdx = args.indexOf("--skilled");
  if (skilledIdx !== -1) {
    thinkLevel = ThinkLevels.ThinkLevelsSkilled;
    args.splice(skilledIdx, 1);
  }

  const prompt = args.join(" ").trim();
  if (!prompt) {
    console.error("Usage: npx tsx index.ts [--skilled] \"Your prompt here\"");
    process.exit(1);
  }

  const secretKey = process.env.DAISI_SECRET_KEY;
  const clientKey = process.env.DAISI_CLIENT_KEY;

  if (!secretKey && !clientKey) {
    console.error(
      "Set DAISI_SECRET_KEY or DAISI_CLIENT_KEY environment variable.",
    );
    process.exit(1);
  }

  const client = await createDaisiClient({
    transportFactory: nodeTransportFactory,
    secretKey,
    clientKey,
  });

  const inference = client.inference.create();
  await inference.sessionManager.negotiateSession();

  for await (const token of inference.send(prompt, thinkLevel)) {
    if (token.Content) {
      process.stdout.write(token.Content);
    }
  }
  console.log();

  await inference.close();
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
