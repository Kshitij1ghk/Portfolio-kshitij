# Kshitij Wankar — Résumé & Portfolio

Vanilla HTML / CSS / JavaScript. No build step, no dependencies, no frameworks.

## Files

| File | What it is |
|---|---|
| `index.html` | The portfolio site |
| `style.css` | All styling; dark/light themes are CSS variables under `[data-theme]` |
| `script.js` | Theme toggle, navbar, typing effect, scroll reveal, counters, skill filter, copy-email |
| `resume.html` | The résumé, laid out to print to exactly one A4 page |
| `Kshitij_Wankar_Resume.pdf` | Print-to-PDF output of `resume.html` |

## Viewing

Open `index.html` directly, or serve it locally:

```bash
cd "E:\claude code\resume port"
python -m http.server 8000
# then visit http://localhost:8000
```

Serving over `http://localhost` is worth it: the **Copy email** button uses the async
Clipboard API where possible and falls back to `execCommand` otherwise. It works either
way, but a secure context (`localhost` or `https`) is the cleaner path.

## Regenerating the PDF

The résumé is the HTML source of truth. To rebuild the PDF after editing `resume.html`:

```bash
chrome --headless --disable-gpu --no-pdf-header-footer \
       --print-to-pdf=Kshitij_Wankar_Resume.pdf resume.html
```

Then confirm it is still **one page** — the vertical rhythm (line-height, `h2` margins,
bullet spacing) is tuned so the content fills a single A4 sheet. If you add a bullet or a
project, tighten `line-height` / `h2` margins before it silently spills to page 2.

## Deploying

Drag the folder onto [Netlify Drop](https://app.netlify.com/drop), or push to GitHub Pages.
Everything is relative-path, so it works from a subdirectory (`/portfolio/`) without edits.

## Content to keep in sync

Both files state overlapping facts. If you update one, update the other:

- **Projects** — the project cards and the repository grid in `index.html`; the Projects block in `resume.html`
- **Skills** — the skill cards in `index.html` and Technical Skills in `resume.html`
- **Education** — the timeline in `index.html` and the Education block in `resume.html`
- **Test counts** — `32` in the hero stat is `16 + 16` across the two pytest suites
- **Repository count** — `16` appears in the hero stat *and* in the repository stats row

### Repository breakdown

The repository section is grouped into four tiers: Applied AI & Python (4), real-world
applications (3), web development (2) and learning repositories (7, all under
StudyGrillTogether) — 16 cards total.

The language-split bar counts by **language, not by tier**, so the four C# learning repos and the
two web learning repos are counted in the C# and Web shares. That gives C# 44%, Python 25%,
Web 25%, SQL 6%. `C-Sharp-Database-Management` is listed under both the C# and database tiers in
the GitHub profile, so it is counted once here, as C#.

**The GitHub profile says 13 repositories. The true total is 16** — the profile table omits
`business-rag-assistant`, `MCP-Powered-Developer-Assistant` and `Asterion-Astrologer`. Worth
fixing the profile, since a recruiter counting the repos will find the same three missing.

### Primary language

The portfolio presents **both** tracks — C#/.NET business applications *and* Python/AI — rather
than picking a single "primary". Your GitHub profile says C# leads by repository count (65%),
while the résumé positions Python as the main language. The portfolio deliberately frames it as
full-stack so neither claim contradicts the other. If you want to commit to one, change the hero
summary and the `C#` / `Python` tags together.

