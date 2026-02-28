# Simple Website on GitHub Pages

This project is a static website in `site/` and deploys automatically to GitHub Pages.

## 1. Edit your site
Files to edit:
- `site/index.html`
- `site/styles.css`
- `site/app.js`

## 2. Create a GitHub repo and push
From this folder:
```powershell
git init
git add .
git commit -m "Initial website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 3. Enable GitHub Pages
1. Open your repo on GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` again (or run workflow manually in **Actions**).

Workflow file used:
- `.github/workflows/pages.yml`

## 4. Your live URL
After deploy completes, your site will be available at:
- `https://YOUR_USERNAME.github.io/YOUR_REPO/`

If your repo is named `YOUR_USERNAME.github.io`, then URL is:
- `https://YOUR_USERNAME.github.io/`

## 5. Update the website
Every push to `main` auto-deploys:
```powershell
git add .
git commit -m "Update site"
git push
```

## Optional: custom domain (free on GitHub side)
You can add a custom domain in **Settings > Pages**. Your domain registrar may cost money.