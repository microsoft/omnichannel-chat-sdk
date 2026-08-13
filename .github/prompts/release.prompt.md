---
mode: 'agent'
description: 'Create a new Release of the Omnichannel Chat SDK'
---

Create an official Omnichannel Chat SDK release.

Read `docs/RELEASING.md` before you make changes. That file is the canonical release procedure.

1. Get the approved semantic version.
2. Create a release branch from current `upstream/main`.
3. Update `package.json` and `package-lock.json` with `npm version <version> --no-git-tag-version`.
4. Move all `CHANGELOG.md` entries from `Unreleased` to the dated version section.
5. Keep a new empty `Unreleased` section.
6. Update public API documentation and the README release table.
7. Run the build, tests, lint, and `npm pack --dry-run`.
8. Open a pull request and wait for all required checks and reviews.
9. Do not create the release tag before the pull request merges.
10. Get the pull-request merge commit.
11. Create annotated tag `v<version>` on that exact commit.
12. Push the tag to `microsoft/omnichannel-chat-sdk`.
13. Do not use workflow dispatch and do not run `npm publish` manually.
14. Wait for the `npm Release` workflow.
15. Verify the exact npm version, npm provenance, GitHub Release notes, and attached `.tgz` file.

The tag workflow validates the tag, publishes one tarball to npm, and attaches that same tarball to the GitHub Release.