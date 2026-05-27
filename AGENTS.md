# Agent Instructions

## Project Shape

GitHub template repository for building LaTeX/PDF resumes from YAML files.

Users fork → add their YAML in `resumes/` → push → GitHub Actions generates PDFs as artifacts.

## Hard Rules

- Never edit generated `.tex` files — they are overwritten on each build
- Edit only the YAML source files in `resumes/`
- `template.tex` is for layout changes only — not for content
- Use plain ASCII in resume content: no emojis, fancy quotes, em dashes

## Architecture

```
resumes/*.yml       source data (user-edited)
template.tex        LaTeX template (layout only)
build.py            validates YAML, renders template, compiles PDF
resumes/*.tex       generated — never edit
resumes/*.pdf       generated — CI artifact
```

## Build Command

```bash
python3 build.py
```

Auto-discovers all `*.yml` files in `resumes/` (excludes `*.example.yml`).

## Resume YAML Schema

```yaml
personal:
  name: string
  title: string
  email: string
  linkedin_url: string
  github_url: string

font: lmodern | charter | cormorant | fira-sans | source-sans

section_titles:
  experience: string
  projects: string
  skills: string
  education: string

experience:
  - company: string
    period: { from: string, to: string }
    role: string
    url: string
    bullets: [string]

projects:
  - company: string
    period: { from: string, to: string }
    role: string
    url: string
    bullets: [string]

skills:
  - label: string
    items: string   # comma-separated

education:
  - institution: string
    period: { from: string, to: string }
    degree: string
    location: string

output_filename: string   # letters, digits, _ and - only
```

`projects: []` hides the section.

## Bullet Formatting

| Marker | Output |
|---|---|
| `**text**` | bold |
| `_text_` | italic |

No raw LaTeX inside bullets.
