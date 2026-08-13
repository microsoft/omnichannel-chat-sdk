# Releasing @microsoft/omnichannel-chat-sdk

## How npm Publishing Works

This package uses **GitHub Actions OIDC trusted publishing** — no npm tokens or secrets are needed. The `npm-release.yml` workflow handles everything.

### Dev Versions (Automatic)

Every push to `main` automatically publishes a dev version to npm:

```
2.0.0-main.abc1234
       ^^^^^^^^^^^^
       branch + short commit SHA (via version-from-git)
```

- **npm dist-tag**: `latest`
- **Install**: Use the exact version from the workflow output, such as `npm install @microsoft/omnichannel-chat-sdk@2.0.0-main.abc1234`
- **Triggered by**: Any merge/push to the `main` branch

The workflow intentionally moves `latest` to each `main` prerelease. An install without a version can receive a prerelease.

### Official Releases (Release PR and Tag)

Use an approved semantic version. In the examples below, replace `2.0.1` and `578` with the new version and pull-request number.

```bash
VERSION=2.0.1
PR_NUMBER=578
```

1. **Create a release branch from current `upstream/main`.**

   ```bash
   git fetch upstream
   git checkout -b "release/v$VERSION" upstream/main
   ```

2. **Set the version in `package.json` and `package-lock.json`.**

   ```bash
   npm version "$VERSION" --no-git-tag-version
   ```

3. **Finalize `CHANGELOG.md`.**

   Move all release entries below `## [$VERSION] - YYYY-MM-DD`. Keep a new `## [Unreleased]` section above that heading.

4. **Open a pull request.**

   Include `package.json`, `package-lock.json`, and `CHANGELOG.md`. Merge the pull request only after all required checks pass.

   The merge to `main` publishes a `VERSION-main.SHA` prerelease with the npm `latest` dist-tag. This publish is expected.

5. **Get the pull-request merge commit.**

   ```bash
   MERGE_SHA=$(gh pr view "$PR_NUMBER" --repo microsoft/omnichannel-chat-sdk --json mergeCommit --jq '.mergeCommit.oid')
   test -n "$MERGE_SHA"
   ```

6. **Create an annotated tag on that merge commit.**

   ```bash
   git fetch upstream --tags
   git tag -a "v$VERSION" "$MERGE_SHA" -m "Release v$VERSION"
   git push upstream "v$VERSION"
   ```

   The tag must equal `v` plus the version in `package.json`. The workflow rejects mismatched tags and prerelease tags.

7. **Wait for the tag workflows.**

Do not use **Run workflow** for an official release. The pushed tag starts the npm and legacy artifact workflows.

The npm workflow publishes the package with `--tag latest`. Then it creates GitHub Release `v$VERSION` with notes and the published npm tarball.

### GitHub Release Notes

The workflow removes `v` from the tag. For example, it converts `v2.0.1` to `2.0.1`.

It finds `## [2.0.1]` in `CHANGELOG.md`. It copies that section until the next `## [` version heading.

The copied text becomes the GitHub Release body. If the matching section is empty or absent, GitHub generates notes from merged pull requests.

The workflow packs the package once. It publishes that `.tgz` file to npm and attaches the same file to the GitHub Release.

### Verifying a Publish

```bash
# Read the version selected by latest
npm view @microsoft/omnichannel-chat-sdk version

# Read all dist-tags
npm view @microsoft/omnichannel-chat-sdk dist-tags

# Check the official version
npm view "@microsoft/omnichannel-chat-sdk@$VERSION" version

# Check the GitHub Release and its asset
gh release view "v$VERSION" --repo microsoft/omnichannel-chat-sdk
```

### Tag Format

| Tag pattern | What publishes | npm dist-tag |
|-------------|---------------|--------------|
| `v*` (e.g. `v2.0.1`) | Release version from `package.json` | `latest` |
| Push to `main` | Dev version `X.Y.Z-main.<sha>` | `latest` |

### Hotfix Versions

For urgent fixes that need to ship against an older release (not `main`), use a hotfix branch:

1. **Create a hotfix branch** from the target commit:
   ```bash
   git checkout -b hotfix/<name> <base-commit-sha>
   ```

2. **Set the version** in `package.json` using prerelease format:
   ```
   "version": "1.11.7-hotfix.<name>.1"
   ```

3. **Apply the fix** (e.g., add a locale code, patch a bug).

4. **Commit and push** the hotfix branch to the upstream repo:
   ```bash
   git push upstream hotfix/<name>
   ```

5. The `npm-release.yml` workflow triggers on `hotfix/**` branches. On hotfix branches, `version-from-git` is **skipped** — the version in `package.json` is used as-is.

6. **Verify the publish**:
   ```bash
   npm view @microsoft/omnichannel-chat-sdk@1.11.7-hotfix.<name>.1
   ```

Do not create a `v*` tag for a hotfix prerelease. The workflow rejects prerelease tags to protect the `latest` dist-tag.

#### Hotfix Version Naming Convention

```
<base-version>-hotfix.<descriptor>.<iteration>
```

- `base-version`: The version the hotfix is based on (e.g., `1.11.7`)
- `descriptor`: Short kebab-case name for the fix (e.g., `enau`)
- `iteration`: Increment if multiple attempts are needed (start at `1`)

Example: `1.11.7-hotfix.enau.1`

### Important Notes

- **Published versions**: npm does not permit a second publish of the same version. Use a new version after npm accepts a bad publish.
- **Trusted publisher**: Configured on npmjs.com to trust `microsoft/omnichannel-chat-sdk` → `npm-release.yml`. No npm tokens needed.
- **Provenance**: All publishes include a signed provenance statement verifiable on npmjs.com.
- **Release notes**: A matching changelog section supplies the GitHub Release notes. GitHub generates notes when the section is absent.
- **Release asset**: Each GitHub Release contains the exact npm `.tgz` file.
