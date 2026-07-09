import esbuild from "esbuild";
import { sassPlugin } from "esbuild-style-plugin";
import fs from "node:fs/promises";
import { execSync } from "node:child_process";

const isProd = process.env.NODE_ENV === "production";
const cssInput = "src/main.css";
const cssOutput = "dist/main.css";

async function build() {
  // Build JS bundle
  await esbuild.build({
    entryPoints: ["src/main.tsx"],
    bundle: true,
    outfile: "dist/main.js",
    format: "iife",
    sourcemap: !isProd,
    minify: isProd,
    target: ["es2018"],
    jsx: "automatic",
    loader: {
      ".png": "file",
      ".svg": "file",
      ".jpg": "file",
      ".jpeg": "file"
    },
    plugins: [sassPlugin()]
  });

  // Ensure dist exists and copy HTML
  await fs.mkdir("dist", { recursive: true });
  await fs.copyFile("index.html", "dist/index.html");

  // Build CSS via Tailwind/PostCSS (uses package.json "build:css" script)
  try {
    console.log("Building CSS with Tailwind/PostCSS...");
    // Run the npm script which runs tailwindcss CLI (postcss is configured via tailwind.config.js/postcss.config.js)
    execSync("npm run build:css", { stdio: "inherit" });

    // Ensure the CSS output exists and move it into dist
    await fs.copyFile(cssOutput, cssOutput);
  } catch (err) {
    console.warn("CSS build step failed - copying source CSS as fallback.");
    // Fallback: copy src/main.css to dist
    await fs.copyFile(cssInput, cssOutput);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
