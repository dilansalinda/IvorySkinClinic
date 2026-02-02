# Fix HTTPS / Certificate Error for ivoryskinclinic.lk

## The Problem
- Browser shows: **"*.github.io certificate name does not match input"**
- You're visiting `ivoryskinclinic.lk` but the server is serving GitHub's default certificate (for `*.github.io`) instead of a certificate for your domain.
- This means GitHub Pages has **not yet issued an SSL certificate** for your custom domain.

## Why This Happens
1. **DNS not fully correct** – GitHub can't verify you own the domain.
2. **Custom domain not set in GitHub** – Or it was set but verification failed.
3. **Certificate not provisioned yet** – DNS was fixed recently; GitHub needs time to request and install the certificate (up to 24 hours).

---

## Step-by-Step Fix

### Step 1: Fix CNAME File (Repository)
✅ **Done.** The CNAME file now contains **only**:
```
ivoryskinclinic.lk
```
GitHub allows **one domain per CNAME file**. Using the apex (root) domain is recommended.

Commit and push this change to your GitHub repository.

---

### Step 2: Configure DNS Correctly

At your **domain registrar** (where you bought ivoryskinclinic.lk):

#### A) Root domain – 4 A records

| Type | Name/Host | Value/Points to | TTL |
|------|-----------|-----------------|-----|
| A    | @ (or leave blank) | 185.199.108.153 | 3600 |
| A    | @                 | 185.199.109.153 | 3600 |
| A    | @                 | 185.199.110.153 | 3600 |
| A    | @                 | 185.199.111.153 | 3600 |

#### B) WWW – 1 CNAME record

| Type  | Name/Host | Value/Points to              | TTL  |
|-------|-----------|------------------------------|------|
| CNAME | www       | YOUR_USERNAME.github.io      | 3600 |

Replace `YOUR_USERNAME` with your GitHub username (e.g. `IvorySkinClinic` or the org/user that owns the repo).

**If you use Cloudflare:** turn **Proxy (orange cloud) OFF** for these records so GitHub can verify and issue the certificate.

---

### Step 3: Set Custom Domain in GitHub Pages

1. Open your repo: **GitHub.com** → your repository (e.g. **Ivory**).
2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Custom domain**:
   - Enter: `ivoryskinclinic.lk` (no `https://`, no `www`).
   - Click **Save**.
4. Wait for the DNS check:
   - If it shows a green check: DNS is correct, GitHub will request the certificate.
   - If it shows an error: follow the message (usually DNS not pointing to GitHub or wrong CNAME target).

---

### Step 4: Trigger Certificate Provisioning

Sometimes GitHub needs a nudge to request the certificate:

1. In **Settings → Pages**, under **Custom domain**:
   - Clear the domain field (delete `ivoryskinclinic.lk`).
   - Click **Save**.
2. Wait **1–2 minutes**.
3. Type `ivoryskinclinic.lk` again and click **Save**.
4. Leave the page; do not change the domain again.

---

### Step 5: Wait for the Certificate

- After DNS is correct and the domain is saved in Pages:
  - GitHub requests a certificate from Let's Encrypt.
  - This can take **from a few minutes up to 24 hours**.
- When it’s ready:
  - In **Settings → Pages** you’ll see a green check next to the custom domain.
  - You can enable **Enforce HTTPS** (or it may enable automatically).

---

## Verify DNS (Before Expecting HTTPS)

Use: https://www.whatsmydns.net/

- **ivoryskinclinic.lk** (A records):  
  Should show: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- **www.ivoryskinclinic.lk** (CNAME):  
  Should show: `username.github.io` (or your Pages URL).

If these are wrong, fix DNS first; HTTPS will not work until they are correct.

---

## Checklist

- [ ] CNAME file in repo contains only `ivoryskinclinic.lk` (and is pushed).
- [ ] 4 A records for root domain pointing to GitHub’s IPs.
- [ ] 1 CNAME for `www` pointing to `username.github.io`.
- [ ] In GitHub: **Settings → Pages → Custom domain** = `ivoryskinclinic.lk`.
- [ ] DNS check in Pages shows success (green check).
- [ ] Waited up to 24 hours for certificate after DNS was fixed.
- [ ] **Enforce HTTPS** enabled in Pages (once the check is green).

---

## If It Still Fails

1. **Clear the custom domain, save, then re-add it** (Step 4 above).
2. **Confirm CNAME file:**  
   In the repo it must be exactly one line: `ivoryskinclinic.lk` (no `www`, no extra lines).
3. **No proxy in front of GitHub:**  
   If using Cloudflare (or similar), set DNS to **DNS only** (grey cloud) for the A and CNAME records.
4. **Repository type:**  
   Ensure Pages is enabled and the source is correct (e.g. “Deploy from a branch” or “GitHub Actions”).
5. **Cache:**  
   Try another browser or incognito, or wait 10–15 minutes after DNS/Pages changes.

Once GitHub successfully verifies the domain and installs the certificate, the “*.github.io certificate name does not match input” error will stop and HTTPS will work for `ivoryskinclinic.lk` and `www.ivoryskinclinic.lk`.
