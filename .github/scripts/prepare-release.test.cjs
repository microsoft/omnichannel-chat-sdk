const assert = require("node:assert/strict");
const { test } = require("node:test");
const { prepareRelease } = require("./prepare-release.cjs");

test("main keeps the documented base-version-main.short-sha format", () => {
	assert.deepEqual(prepareRelease("0.6.0", "refs/heads/main", "316a2fa63c58399fc5029ba8d409afd982c719cd"),
		{ version: "0.6.0-main.316a2fa", tag: "latest" });
	assert.equal(prepareRelease("0.6.0-old.1+build", "refs/heads/main", "abcdef0123").version,
		"0.6.0-main.abcdef0");
});

test("stable tags and hotfix versions retain their existing dist-tags", () => {
	assert.deepEqual(prepareRelease("1.2.3", "refs/tags/v1.2.3", ""), { version: "1.2.3", tag: "latest" });
	assert.deepEqual(prepareRelease("1.2.3-hotfix.test.1", "refs/heads/hotfix/test", ""),
		{ version: "1.2.3-hotfix.test.1", tag: "hotfix" });
	assert.deepEqual(prepareRelease("1.2.3", "refs/heads/test", ""), { version: "1.2.3", tag: "latest" });
});

test("mismatched and prerelease release tags fail closed", () => {
	assert.throws(() => prepareRelease("1.2.3", "refs/tags/v1.2.4", ""));
	assert.throws(() => prepareRelease("1.2.3-beta.1", "refs/tags/v1.2.3-beta.1", ""));
	assert.throws(() => prepareRelease("1.2.3", "refs/heads/main", "not-a-commit"));
});

test("invalid versions and shell-shaped values never become release metadata", () => {
	for (const version of ["$(echo bad)", "`echo bad`", '1.2.3"; echo bad', "1.2.3\nother=value", "1.2.3\n", " 1.2.3", "01.2.3", "1.2.3-01", undefined]) {
		assert.throws(() => prepareRelease(version, "refs/heads/main", "abcdef0123"));
	}
});
