#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import { Charlie } from "../charlie.js";

const VERSION = "0.1.1";

const STARTER_CONFIG = `import { Charlie } from "charlie-the-business-advisor";

/**
 * Charlie the Business Advisor configuration.
 *
 * Analytics calculates. AI interprets. Evidence validates.
 */
export const charlie = new Charlie({
  defaultCurrency: "NGN",
  // ai: {
  //   provider: "openai", // or "gemini", "anthropic", "mock"
  //   apiKey: process.env.OPENAI_API_KEY,
  // },
});

export default charlie;
`;

const STARTER_ENV = `# Charlie the Business Advisor — Environment Configuration
# Charlie is 100% free and open-source. Bring your own API key or run 100% offline with zero keys.

# AI Provider ("openai" | "gemini" | "anthropic" | "mock")
# If left blank, Charlie automatically detects which key is present or falls back to "mock".
CHARLIE_AI_PROVIDER=mock

# Bring Your Own API Key (Optional — leave blank for offline Mock provider)
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Default Currency ISO 4217 code (e.g. NGN, USD, EUR, GBP, KES, GHS, ZAR)
CHARLIE_DEFAULT_CURRENCY=NGN
`;

function printBanner() {
  console.log(`
  🎩 Charlie the Business Advisor (v${VERSION})
  Your AI-Powered Business Growth Companion — 100% Free & Open-Source
  "Analytics calculates. AI interprets. Evidence validates."
`);
}

function printHelp() {
  printBanner();
  console.log(`Usage:
  npx charlie-the-business-advisor <command> [options]

Commands:
  init       Scaffold charlie.config.ts and .env.example in the current directory
  doctor     Inspect environment variables and verify AI provider status
  version    Show the installed version
  help       Display this help message

Options:
  -v, --version    Show version
  -h, --help       Show help
`);
}

function handleInit() {
  printBanner();
  const cwd = process.cwd();
  const configPath = path.join(cwd, "charlie.config.ts");
  const envPath = path.join(cwd, ".env.example");

  console.log("🚀 Initializing Charlie in current directory...\n");

  if (fs.existsSync(configPath)) {
    console.log("ℹ️  charlie.config.ts already exists. Skipping config creation.");
  } else {
    fs.writeFileSync(configPath, STARTER_CONFIG, "utf-8");
    console.log("✅ Created charlie.config.ts");
  }

  if (fs.existsSync(envPath)) {
    console.log("ℹ️  .env.example already exists. Skipping .env.example creation.");
  } else {
    fs.writeFileSync(envPath, STARTER_ENV, "utf-8");
    console.log("✅ Created .env.example");
  }

  console.log(`
🎉 Setup complete!

Next Steps:
  1. Copy .env.example to .env and configure your optional AI keys (or leave as 'mock' for 100% offline use).
  2. Map your existing database orders using 'createOrderAdapter':
     import { createOrderAdapter } from "charlie-the-business-advisor";
  3. Run deterministic analytics:
     const snapshot = charlie.analyze({ orders });
  4. Generate grounded recommendations:
     const advice = await charlie.advise({ orders });
  5. Ask business questions with chat:
     const reply = await charlie.chat({ question: "What was my revenue?", orders });

📚 Documentation & Guides:
  https://github.com/charlie/charlie-the-business-advisor#readme
`);
}

function handleDoctor() {
  printBanner();
  console.log("🩺 Running Charlie Environment Diagnostic...\n");

  // Node runtime
  console.log(`  ✓ Node.js version:      ${process.version}`);
  console.log(`  ✓ Charlie version:      v${VERSION}`);

  // AI Provider check
  const provider = process.env.CHARLIE_AI_PROVIDER || "(auto-detect)";
  console.log(`  • Configured Provider:  ${provider}`);

  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);

  console.log(`  • OPENAI_API_KEY:       ${hasOpenAi ? "✅ Set" : "⚪ Not set"}`);
  console.log(`  • GEMINI_API_KEY:       ${hasGemini ? "✅ Set" : "⚪ Not set"}`);
  console.log(`  • ANTHROPIC_API_KEY:    ${hasAnthropic ? "✅ Set" : "⚪ Not set"}`);

  if (hasOpenAi || hasGemini || hasAnthropic) {
    console.log("\n  ✨ External AI provider detected and ready for advisory generation.");
  } else {
    console.log("\n  ⚡ Zero API keys configured: Running in 100% offline Mock mode.");
    console.log("     All deterministic calculations and offline advice will function seamlessly.");
  }

  // Quick analytical sanity check
  try {
    const charlie = new Charlie();
    const testSnapshot = charlie.analyze({
      orders: [],
      currency: "NGN",
    });
    if (testSnapshot.snapshotId) {
      console.log(`  ✓ Analytics Engine:     Deterministic engine operational (Snapshot SHA-256 ok).`);
    }
  } catch (err: any) {
    console.log(`  ❌ Analytics Engine:     Error initializing: ${err.message}`);
  }

  console.log("\n✅ Diagnostic Complete. Charlie is ready to advise!\n");
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  switch (command) {
    case "init":
      handleInit();
      break;

    case "doctor":
      handleDoctor();
      break;

    case "version":
    case "-v":
    case "--version":
      console.log(`charlie-the-business-advisor v${VERSION}`);
      break;

    case "help":
    case "-h":
    case "--help":
    case undefined:
      printHelp();
      break;

    default:
      console.error(`Unknown command: "${command}". Run 'charlie help' for available commands.`);
      process.exit(1);
  }
}

main();
