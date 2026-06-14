#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function removeAllChildren(targetDir) {
  if (!fs.existsSync(targetDir)) return;
  for (const item of fs.readdirSync(targetDir)) {
    const itemPath = path.join(targetDir, item);
    fs.rmSync(itemPath, { recursive: true, force: true });
  }
}

function cleanBuildOutput() {
  const projectRoot = path.resolve("..");
  const kuroDir = path.join(projectRoot, "htdocs", "luci-static", "kuro");
  const resourcesDir = path.join(
    projectRoot,
    "htdocs",
    "luci-static",
    "resources",
  );

  console.log("🧹 start clean build output...");

	if (fs.existsSync(kuroDir)) {
		for (const item of fs.readdirSync(kuroDir)) {
			const itemPath = path.join(kuroDir, item);
			console.log(`   remove: ${itemPath}`);
			fs.rmSync(itemPath, { recursive: true, force: true });
		}
	}

  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir, { recursive: true });
  } else {
    console.log(`   clean: ${resourcesDir}/*`);
    removeAllChildren(resourcesDir);
  }

  console.log("✅ clean build output done!");
}

cleanBuildOutput();
