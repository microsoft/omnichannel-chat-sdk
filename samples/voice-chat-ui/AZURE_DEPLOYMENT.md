# Deploying ARTAgent to Azure Static Web App

This guide explains how to deploy the ARTAgent voice chat application to Azure Static Web App.

## Prerequisites

1. **Azure Account** - Sign up at https://azure.microsoft.com/free/ (includes $200 free credits)
2. **GitHub Account** - Your fork of the repository (already done!)
3. **Azure CLI** (optional but recommended)
   ```bash
   # Download from: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows
   ```

## Step 1: Create Azure Static Web App via Azure Portal

### Option A: Using Azure Portal (Easiest)

1. Go to https://portal.azure.com
2. Click **Create a resource**
3. Search for **"Static Web App"** and click it
4. Click **Create**

### Fill in the Details:

**Basics Tab:**
- **Resource Group**: Create new → `rg-artagent-demo`
- **Name**: `artagent-chat` (or your preferred name)
- **Plan Type**: Free
- **Region**: Select closest to you (e.g., East US, West Europe)

**Deployment Details Tab:**
- **Source**: GitHub
- **GitHub Account**: Click "Sign in with GitHub"
- **Organization**: Select your account (Daniel818GBB)
- **Repository**: `omnichannel-chat-sdk`
- **Branch**: `main`

**Build Details Tab:**
- **Build Presets**: `React`
- **App location**: `samples/voice-chat-ui`
- **API location**: (leave blank - no backend API)
- **Output location**: `build`

3. Click **Review + create**
4. Click **Create**

Azure will now:
- Create the Static Web App resource
- Set up GitHub Actions workflow
- Deploy your app automatically

---

## Step 2: Configure Environment Variables in Azure

Your app needs the Omnichannel and DirectLine configuration variables.

1. Go to your Static Web App resource in Azure Portal
2. Click **Settings** → **Configuration** (or **Environment**)
3. Add these variables (without the `REACT_APP_` prefix in Azure):
   - **ORG_URL**: `https://your-org.crm.oc.crmlivetie.com`
   - **ORG_ID**: Your organization ID
   - **WIDGET_ID**: Your chat widget ID
   - **CPS_BOT_ID**: Your Copilot Studio bot ID
   - **DIRECTLINE_TOKEN_URL**: Your DirectLine token endpoint

4. Click **Save**

---

## Step 3: Configure GitHub Actions Workflow

Azure creates a GitHub Actions workflow automatically. You need to update it to use your environment variables.

### Option A: Automatic Setup (Recommended)

The workflow file is in: `.github/workflows/azure-static-web-apps-*.yml`

Edit the file to pass environment variables during build:

```yaml
- name: Build And Deploy
  id: builddeploy
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: "upload"
    app_location: "samples/voice-chat-ui"
    output_location: "build"
    skip_app_build: false
  env:
    REACT_APP_ORG_URL: ${{ secrets.ORG_URL }}
    REACT_APP_ORG_ID: ${{ secrets.ORG_ID }}
    REACT_APP_WIDGET_ID: ${{ secrets.WIDGET_ID }}
    REACT_APP_CPS_BOT_ID: ${{ secrets.CPS_BOT_ID }}
    REACT_APP_DIRECTLINE_TOKEN_URL: ${{ secrets.DIRECTLINE_TOKEN_URL }}
```

### Option B: Manual GitHub Secrets Setup

1. Go to your GitHub repository fork
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each variable:
   - Name: `ORG_URL`, Value: `https://your-org.crm.oc.crmlivetie.com`
   - Name: `ORG_ID`, Value: Your org ID
   - Name: `WIDGET_ID`, Value: Your widget ID
   - Name: `CPS_BOT_ID`, Value: Your bot ID
   - Name: `DIRECTLINE_TOKEN_URL`, Value: Your DirectLine endpoint

---

## Step 4: Deploy via GitHub Actions

1. Once you add the environment variables to GitHub Secrets, push a change:
   ```bash
   git add .
   git commit -m "chore: Add Azure deployment configuration"
   git push origin main
   ```

2. Go to your GitHub repo → **Actions** tab
3. Watch the workflow run
4. Once complete, your app is live!

### View Deployment Status:
- Azure Portal: Your Static Web App resource
- GitHub: Actions → Latest workflow run
- Live URL: https://`<your-app-name>`.azurestaticapps.net

---

## Step 5: Test Your Deployment

1. Open your Static Web App URL
2. Test features:
   - ✅ Text messaging
   - ✅ Voice recording (may need HTTPS)
   - ✅ Bot responses
   - ✅ Session tracking

### If Voice Recording Doesn't Work:

Voice features require HTTPS and may need additional browser configuration:

1. **Enable HTTPS**: Azure Static Web App provides HTTPS by default ✅
2. **Test in modern browser**: Chrome, Edge, Firefox, Safari
3. **Check console for errors**: F12 → Console

---

## Step 6: Configure Custom Domain (Optional)

To use your own domain instead of `azurestaticapps.net`:

1. In Azure Portal, go to your Static Web App
2. Click **Custom domains**
3. Click **Add**
4. Enter your custom domain
5. Update DNS records at your domain registrar
6. Verify and activate

---

## Troubleshooting

### App Won't Deploy

**Problem**: GitHub Actions workflow fails

**Solutions**:
1. Check workflow logs: GitHub → Actions → Latest run
2. Verify build location: `samples/voice-chat-ui`
3. Check environment variables are set
4. Ensure `package.json` exists in the app directory

### Configuration Variables Not Working

**Problem**: App shows errors about missing configuration

**Solutions**:
1. Verify variable names start with `REACT_APP_` in app code
2. Check GitHub Secrets are set correctly
3. Rebuild: Make a dummy commit and push to trigger rebuild
4. Check browser console for actual error messages

### Voice Features Not Working

**Problem**: Microphone access denied or no transcription

**Solutions**:
1. Allow microphone in browser permissions
2. Use HTTPS (Azure Static Web App provides this)
3. Try in Chrome/Edge first (best Web Speech API support)
4. Check browser console for specific errors

### CORS Errors with Omnichannel

**Problem**: Messages fail with CORS error

**Solutions**:
1. Verify Omnichannel widget is configured for your domain
2. Add your Static Web App domain to CORS allowlist in Omnichannel
3. Check organization URL is correct in environment variables

---

## Monitoring & Logs

### View Application Logs

1. Azure Portal → Your Static Web App
2. Click **Logs** (or **Application Insights** if enabled)
3. View real-time logs and errors

### Enable Monitoring

1. Go to your Static Web App resource
2. Click **Monitoring** → **Application Insights**
3. Click **Enable**
4. Choose existing or create new Application Insights
5. Monitor performance and errors

---

## Cost Estimation

**Azure Static Web Apps Pricing** (as of Nov 2025):
- **Free tier**: 
  - 1 GB storage
  - 100 GB bandwidth/month
  - ✅ Perfect for demos and testing
  
- **Standard tier**: ~$10/month + bandwidth
  - Unlimited storage
  - More advanced features

Your demo will stay completely **FREE** on the Free tier.

---

## Next Steps

After deployment, you can:

1. **Share Your App**:
   - Send the URL to colleagues
   - Demo to stakeholders
   - Integrate with other systems

2. **Improve the App**:
   - Add more features
   - Integrate Azure Speech Services for better transcription
   - Add authentication
   - Add chat history persistence

3. **Set Up CI/CD**:
   - GitHub Actions already handles this
   - Any push to `main` auto-deploys
   - Set up staging environment for testing

4. **Monitor Performance**:
   - Set up alerts in Application Insights
   - Track usage metrics
   - Monitor errors and performance

---

## Advanced: Manual CLI Deployment

If you prefer command-line deployment:

```bash
# 1. Install Azure CLI
# https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows

# 2. Login to Azure
az login

# 3. Create resource group
az group create --name rg-artagen-demo --location eastus

# 4. Create Static Web App
az staticwebapp create \
  --name artagent-chat \
  --resource-group rg-artagen-demo \
  --source https://github.com/Daniel818GBB/omnichannel-chat-sdk \
  --branch main \
  --app-location "samples/voice-chat-ui" \
  --output-location "build"

# 5. Get deployment token for GitHub
az staticwebapp secrets list --name artagent-chat --query properties.apiKey --output tsv
# Copy this token and add to GitHub Secrets as AZURE_STATIC_WEB_APPS_API_TOKEN
```

---

## Resources

- **Azure Static Web App Docs**: https://learn.microsoft.com/en-us/azure/static-web-apps/
- **GitHub Actions Integration**: https://github.com/features/actions
- **Omnichannel Chat SDK**: ../../README.md
- **Azure Free Account**: https://azure.microsoft.com/free/

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section above
2. Review Azure Portal logs
3. Check GitHub Actions workflow logs
4. Open issue on GitHub with:
   - Error message
   - Workflow logs (sanitized)
   - Configuration details (redacted)

