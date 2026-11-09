const { execFileSync } = require("node:child_process");
const { appendFileSync, readFileSync } = require("node:fs");

const numeric = "(?:0|[1-9][0-9]*)";
const identifier = "(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)";
const semver = new RegExp(`^${numeric}\\.${numeric}\\.${numeric}(?:-${identifier}(?:\\.${identifier})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);

function prepareRelease(version, ref, sha) {
	if (typeof version !== "string" || version.trim() !== version || !semver.test(version)) {
		throw new Error("package.json must contain a valid semantic version.");
	}

	if (ref.startsWith("refs/tags/v")) {
		if (ref !== `refs/tags/v${version}` || version.split("+")[0].includes("-")) {
			throw new Error("Release tags must match a stable package version.");
		}
	}

	if (ref === "refs/heads/main") {
		if (!/^[0-9a-f]{7,40}$/.test(sha)) {
			throw new Error("A valid Git commit is required for a main prerelease.");
		}
		version = `${version.split(/[+-]/)[0]}-main.${sha.slice(0, 7)}`;
	}

	return {
		version,
		tag: ref.startsWith("refs/heads/hotfix/") ? "hotfix" : "latest"
	};
}

if (require.main === module) {
	const pkg = JSON.parse(readFileSync("package.json", "utf8"));
	const nodeVersion = readFileSync(".nvmrc", "utf8").trim();
	if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(nodeVersion)) {
		throw new Error(".nvmrc must contain an exact Node.js version.");
	}
	const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
	const release = prepareRelease(pkg.version, process.env.GITHUB_REF, sha);
	appendFileSync(process.env.GITHUB_OUTPUT,
		`version=${release.version}\ntag=${release.tag}\nnode-version=${nodeVersion}\n`);
}

module.exports = { prepareRelease };
