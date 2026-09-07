# Blogger → GitHub Pages

Converted 60 posts from Blogger.

## Format: JEKYLL
Filename style: jekyll

## 3-Step Deploy

### 1. Create GitHub repo
- Go to https://github.com/new
- Name: ahlesunnah (or any name)
- Keep it public for free Pages

### 2. Push these files
```bash
git init
git add .
git commit -m "Import from Blogger"
git branch -M main
git remote add origin https://github.com/Fali17.github.io/ahlesunnah.git
git push -u origin main
```

### 3. Enable GitHub Pages

- Go to Settings → Pages → Source: Deploy from branch (main / root)
- Jekyll builds automatically. Your site will be at https://Fali17.github.io.github.io/ahlesunnah/




## Notes
- Images are kept as remote URLs. If you checked "Download images locally", run a local script to fetch them into /images.
- Drafts: included (marked with draft flag)
- All conversion happened locally in your browser.

Enjoy!
