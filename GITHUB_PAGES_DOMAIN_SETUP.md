# GitHub Pages Domain Setup Guide for ivoryskinclinic.lk

## Problem
- Domain `ivoryskinclinic.lk` is not eligible for HTTPS
- Domain does not resolve to GitHub Pages server
- Both `www.ivoryskinclinic.lk` and alternate name are improperly configured

## Solution Steps

### Step 1: Verify CNAME File
Make sure your `CNAME` file contains:
```
ivoryskinclinic.lk
www.ivoryskinclinic.lk
```

Or just:
```
ivoryskinclinic.lk
```

### Step 2: Configure DNS Records at Your Domain Registrar

Go to your domain registrar (where you bought `ivoryskinclinic.lk`) and configure DNS records:

#### Option A: Using CNAME Records (Recommended)

**For www subdomain:**
- **Type**: CNAME
- **Name**: `www`
- **Value**: `your-username.github.io` (replace with your GitHub username)
- **TTL**: 3600 (or default)

**For root domain (ivoryskinclinic.lk):**
- **Type**: A (IPv4) - You need 4 A records pointing to GitHub Pages IPs:
  - **Name**: `@` or blank
  - **Value**: `185.199.108.153`
  - **TTL**: 3600
  
  - **Name**: `@` or blank
  - **Value**: `185.199.109.153`
  - **TTL**: 3600
  
  - **Name**: `@` or blank
  - **Value**: `185.199.110.153`
  - **TTL**: 3600
  
  - **Name**: `@` or blank
  - **Value**: `185.199.111.153`
  - **TTL**: 3600

#### Option B: Using ALIAS/ANAME (if supported by registrar)

Some registrars support ALIAS/ANAME records:
- **Type**: ALIAS or ANAME
- **Name**: `@` (root domain)
- **Value**: `your-username.github.io`
- **TTL**: 3600

### Step 3: Configure GitHub Pages Settings

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under **Custom domain**, enter: `ivoryskinclinic.lk`
4. Check **"Enforce HTTPS"** (this will be enabled automatically after DNS propagates)
5. Click **Save**

### Step 4: Wait for DNS Propagation

- DNS changes can take 24-48 hours to propagate globally
- Check DNS propagation: https://www.whatsmydns.net/#A/ivoryskinclinic.lk
- Verify all 4 A records resolve correctly

### Step 5: Verify Configuration

1. **Check DNS Resolution:**
   ```bash
   # Check A records
   dig ivoryskinclinic.lk A
   
   # Check CNAME for www
   dig www.ivoryskinclinic.lk CNAME
   ```

2. **Check GitHub Pages Status:**
   - Go to repository Settings → Pages
   - Look for green checkmark next to custom domain
   - Should show "DNS check successful"

3. **Test HTTPS:**
   - After DNS propagates, GitHub will automatically provision SSL certificate
   - This can take a few hours after DNS is correct
   - Visit: https://ivoryskinclinic.lk

## Common Issues & Solutions

### Issue: "Domain does not resolve to GitHub Pages server"
**Solution:**
- Verify DNS A records point to GitHub Pages IPs (185.199.108.153, etc.)
- Make sure CNAME file in repository matches your domain
- Wait for DNS propagation (can take up to 48 hours)

### Issue: "Not eligible for HTTPS"
**Solution:**
- HTTPS is automatically enabled after DNS is correctly configured
- Make sure domain is properly verified in GitHub Pages settings
- Wait for SSL certificate provisioning (can take a few hours)

### Issue: "www subdomain not working"
**Solution:**
- Add `www.ivoryskinclinic.lk` to CNAME file
- Create CNAME record for www pointing to `your-username.github.io`
- Or use A records for www as well

## Quick DNS Checklist

- [ ] CNAME file contains `ivoryskinclinic.lk` (and optionally `www.ivoryskinclinic.lk`)
- [ ] 4 A records configured for root domain pointing to GitHub Pages IPs
- [ ] CNAME record for www pointing to `your-username.github.io`
- [ ] Custom domain configured in GitHub Pages settings
- [ ] DNS propagated (check with whatsmydns.net)
- [ ] SSL certificate provisioned (check HTTPS in browser)

## GitHub Pages IP Addresses (Updated)

As of 2024, GitHub Pages uses these IP addresses:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

## Alternative: Use Cloudflare (Recommended)

If your registrar doesn't support proper DNS configuration, consider using Cloudflare:

1. Sign up for Cloudflare (free)
2. Add your domain to Cloudflare
3. Update nameservers at your registrar to Cloudflare's nameservers
4. Configure DNS in Cloudflare:
   - A record: `@` → `185.199.108.153` (and other 3 IPs)
   - CNAME: `www` → `your-username.github.io`
5. Enable SSL/TLS in Cloudflare (automatic)

## Need Help?

- GitHub Pages Docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- DNS Check Tool: https://www.whatsmydns.net/
- GitHub Support: Check repository Settings → Pages for specific error messages
