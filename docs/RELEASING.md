# Releasing @microsoft/omnichannel-chat-sdk

## How npm Publishing Works

This package uses **GitHub Actions OIDC trusted publishing** — no npm tokens or secrets are needed. The `npm-release.yml` workflow handles everything.

### Dev Versions (Automatic)

Every push to `main` automatically publishes a dev version to npm:

```
1.11.8-main.abc1234
       ^^^^^^^^^^^^
       branch + short commit SHA (via version-from-git)
```

- **npm tag**: `main` (not `latest`)
- **Install**: `npm install @microsoft/omnichannel-chat-sdk@main`
- **Triggered by**: Any merge/push to the `main` branch

### Release Versions (Manual — Tag Push)

To publish a release version (e.g. `1.12.0`):

1. **Update the version** in `package.json`:
   ```bash
   # Edit package.json version field to the new version
   ```

2. **Update the changelog** in `CHANGELOG.md`

3. **Commit and push** to main:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to 1.12.0"
   git push
   ```

4. **Create and push a tag**:
   ```bash
   git tag v1.12.0
   git push origin v1.12.0
   ```

5. The `npm-release.yml` workflow will:
   - Build the package (`npm run build:tsc`)
   - Publish to npm with `--tag latest`
   - Include provenance attestation (visible on npmjs.com)

### Verifying a Publish

```bash
# Check latest release version
npm view @microsoft/omnichannel-chat-sdk version

# Check all dist-tags (latest + main)
npm view @microsoft/omnichannel-chat-sdk dist-tags

# Check a specific dev version
npm view @microsoft/omnichannel-chat-sdk@main version
```

### Tag Format

| Tag pattern | What publishes | npm dist-tag |
|-------------|---------------|--------------|
| `v*` (e.g. `v1.12.0`) | Release version from `package.json` | `latest` |
| Push to `main` | Dev version `X.Y.Z-main.<sha>` | `main` |

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

#### Hotfix Version Naming Convention

```
<base-version>-hotfix.<descriptor>.<iteration>
```

- `base-version`: The version the hotfix is based on (e.g., `1.11.7`)
- `descriptor`: Short kebab-case name for the fix (e.g., `enau`)
- `iteration`: Increment if multiple attempts are needed (start at `1`)

Example: `1.11.7-hotfix.enau.1`

### Important Notes

- **Burned versions**: If a publish fails, that version number is consumed by npm. You must bump to the next version.
- **Trusted publisher**: Configured on npmjs.com to trust `microsoft/omnichannel-chat-sdk` → `npm-release.yml`. No npm tokens needed.
- **Provenance**: All publishes include a signed provenance statement verifiable on npmjs.com.
