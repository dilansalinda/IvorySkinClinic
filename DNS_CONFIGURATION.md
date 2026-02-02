# DNS Configuration for ivoryskinclinic.lk

## Current Issue
- Domain not resolving to GitHub Pages
- HTTPS not eligible
- DNS misconfiguration

## Required DNS Records

### At Your Domain Registrar (where you bought ivoryskinclinic.lk)

#### 1. Root Domain (ivoryskinclinic.lk) - Use A Records

Create **4 A records** pointing to GitHub Pages IP addresses:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ (or blank) | 185.199.108.153 | 3600 |
| A | @ (or blank) | 185.199.109.153 | 3600 |
| A | @ (or blank) | 185.199.110.153 | 3600 |
| A | @ (or blank) | 185.199.111.153 | 3600 |

**Note:** Some registrars require you to create these as separate records. The "@" symbol represents the root domain.

#### 2. WWW Subdomain (www.ivoryskinclinic.lk) - Use CNAME Record

Create **1 CNAME record**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_GITHUB_USERNAME.github.io | 3600 |

**Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.**

For example, if your GitHub username is `dilansalinda`, the value would be:
```
dilansalinda.github.io
```

## Step-by-Step Instructions

### Step 1: Find Your GitHub Pages URL
1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Note your GitHub Pages URL (e.g., `https://dilansalinda.github.io/Ivory/` or `https://dilansalinda.github.io/`)
4. Your username is the part before `.github.io`

### Step 2: Configure DNS at Your Registrar

**Common Registrars:**

#### GoDaddy:
1. Log in → My Products → DNS
2. Add 4 A records for root domain (@) with IPs above
3. Add 1 CNAME record: Name = `www`, Value = `username.github.io`

#### Namecheap:
1. Domain List → Manage → Advanced DNS
2. Add 4 A records: Host = `@`, Value = IP addresses
3. Add CNAME: Host = `www`, Value = `username.github.io`

#### Cloudflare (Recommended):
1. Add site to Cloudflare
2. DNS → Add record:
   - Type: A, Name: @, IPv4: 185.199.108.153 (Proxy: Off)
   - Repeat for other 3 IPs
   - Type: CNAME, Name: www, Target: username.github.io (Proxy: Off)

#### Other Registrars:
- Look for "DNS Management" or "DNS Settings"
- Add A records for root domain
- Add CNAME for www subdomain

### Step 3: Update CNAME File (Already Done)
✅ The CNAME file has been updated to include both domains:
```
ivoryskinclinic.lk
www.ivoryskinclinic.lk
```

### Step 4: Configure GitHub Pages
1. Repository → Settings → Pages
2. Under "Custom domain", enter: `ivoryskinclinic.lk`
3. Check "Enforce HTTPS" (will be enabled after DNS propagates)
4. Save

### Step 5: Verify DNS Propagation

**Check DNS Resolution:**
- Visit: https://www.whatsmydns.net/#A/ivoryskinclinic.lk
- All locations should show the 4 GitHub Pages IPs
- Visit: https://www.whatsmydns.net/#CNAME/www.ivoryskinclinic.lk
- Should show your GitHub Pages URL

**Command Line Check:**
```bash
# Check A records
dig ivoryskinclinic.lk A

# Check CNAME
dig www.ivoryskinclinic.lk CNAME
```

### Step 6: Wait for Propagation
- DNS changes: 24-48 hours
- GitHub SSL certificate: 1-24 hours after DNS is correct
- Total: Up to 72 hours

## Troubleshooting

### "Domain does not resolve to GitHub Pages server"
- ✅ Verify all 4 A records are configured
- ✅ Check CNAME for www points to `username.github.io`
- ✅ Ensure CNAME file in repo matches your domain
- ✅ Wait for DNS propagation

### "Not eligible for HTTPS"
- This is normal until DNS is correctly configured
- HTTPS will be automatically enabled after DNS resolves correctly
- Can take up to 24 hours after DNS is fixed

### "Both www and alternate name improperly configured"
- Make sure CNAME file has both domains
- Verify DNS records for both root and www
- Check GitHub Pages settings show both domains

## Quick Verification Checklist

- [ ] CNAME file updated with both domains
- [ ] 4 A records configured for root domain
- [ ] 1 CNAME record configured for www
- [ ] GitHub Pages custom domain set to `ivoryskinclinic.lk`
- [ ] DNS propagated (check whatsmydns.net)
- [ ] Repository pushed to GitHub
- [ ] GitHub Pages enabled and deployed

## Important Notes

1. **Do NOT use CNAME for root domain** - Use A records only
2. **Do NOT use ALIAS/ANAME** unless your registrar specifically supports it for GitHub Pages
3. **Wait for propagation** - Changes take time to propagate globally
4. **HTTPS is automatic** - GitHub will provision SSL certificate once DNS is correct
5. **Keep CNAME file** - Don't delete it, it tells GitHub which domain to use

## Need Your GitHub Username?

To complete the CNAME record, I need to know:
- What's your GitHub username? (The one hosting this repository)

Once you provide it, I can give you the exact CNAME value to use.
