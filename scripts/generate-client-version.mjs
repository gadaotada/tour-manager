import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");
const rootPackagePath = path.join(rootDir, "package.json");
const clientPublicDir = path.join(rootDir, "client", "public");
const versionPath = path.join(clientPublicDir, "client-version.json");
const shouldEnsureOnly = process.argv.includes("--ensure");

if (shouldEnsureOnly && fs.existsSync(versionPath)) {
  console.log(`Client version already exists at ${versionPath}`);
  process.exit(0);
}

const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, "utf8"));
const previousVersion = readPreviousVersion();
const release = rootPackage.version ?? "0.0.0";
const buildNumber = previousVersion.build_number + 1;
const generatedAt = new Date().toISOString();
const buildId = `${release}-${String(buildNumber).padStart(6, "0")}`;

const nextVersion = {
  build_id: buildId,
  build_number: buildNumber,
  generated_at: generatedAt,
  release,
};

fs.mkdirSync(clientPublicDir, { recursive: true });
fs.writeFileSync(`${versionPath}.tmp`, `${JSON.stringify(nextVersion, null, 2)}\n`);
fs.renameSync(`${versionPath}.tmp`, versionPath);

console.log(`Generated client version ${buildId}`);

function readPreviousVersion() {
  if (!fs.existsSync(versionPath)) {
    return { build_number: 0 };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(versionPath, "utf8"));

    return {
      build_number:
        typeof parsed.build_number === "number" && Number.isInteger(parsed.build_number)
          ? parsed.build_number
          : 0,
    };
  } catch {
    return { build_number: 0 };
  }
}
