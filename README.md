# Resume Manager

A GitHub template repository for building professional LaTeX/PDF resumes from YAML data files — no local LaTeX or Python required.

Push your YAML → GitHub Actions compiles it → PDF ready as a workflow artifact.

## Quick Start

1. Click **"Use this template"** and create your **private** repository
2. Copy an example YAML to the resume data directory:
   ```bash
   cp skills/resume-manager/examples/resume-data-en.example.yml \
      data/output/latex/resume-data.yml
   ```
3. Edit `data/output/latex/resume-data.yml` with your information
4. Push to `main` → check the **Actions** tab → download the PDF artifact

> **Privacy:** Keep your repository private. Your YAML files contain personal contact information.

## How It Works

```
data/output/latex/resume-data.yml
  + templates/output/latex/curriculo_template.tex
  → skills/resume-manager/scripts/build_resume.py
  → PDF (uploaded as GitHub Actions artifact, 90-day retention)
```

The build script validates your YAML, renders the LaTeX template, and compiles a PDF — all in CI, so you need nothing installed locally.

## Multiple Languages / Resumes

Name your files `resume-data-<suffix>.yml` to build multiple PDFs in one run:

```
data/output/latex/
  resume-data-en.yml   →  resume_your_name_en.pdf
  resume-data-pt.yml   →  resume_seu_nome_pt.pdf
```

## YAML Schema

Full reference: [`skills/resume-manager/references/resume-schema.md`](skills/resume-manager/references/resume-schema.md)

```yaml
personal:
  name: Your Name
  title: Your Title
  email: your@email.com
  linkedin_url: https://linkedin.com/in/your-username
  github_url: https://github.com/your-username

font: lmodern  # lmodern | charter | cormorant | fira-sans | source-sans

section_titles:
  experience: Experience
  projects: Projects
  education: Education
  skills: Technical Skills

experience:
  - company: Company Name
    period:
      from: Jan 2023
      to: Present
    role: Your Role
    url: https://company.com
    bullets:
      - Built a feature with **bold text** and _italic text_.

projects: []  # set to [] to hide the section

skills:
  - label: Backend
    items: TypeScript, Node.js, PostgreSQL

education:
  - institution: University Name
    period:
      from: Jan 2020
      to: Dec 2024
    degree: Bachelor of Science in Computer Science
    location: City, State

output_filename: resume_your_name  # letters, digits, _ and - only
```

### Bullet Formatting

| YAML marker | Result |
|---|---|
| `**text**` | **bold** |
| `_text_` | _italic_ |

Do not write raw LaTeX inside YAML bullets.

## Customizing the Layout

Edit `templates/output/latex/curriculo_template.tex` to change fonts, margins, or section order. The CI picks up template changes automatically on the next push.

## Running Locally

Requires Python 3.10+ and a LaTeX distribution with `pdflatex`.

```bash
pip install pyyaml
python3 skills/resume-manager/scripts/build_resume.py \
  --template templates/output/latex/curriculo_template.tex
```

## Using with Claude Code (optional)

This repo bundles [Claude Code](https://claude.ai/code) skills for AI-assisted resume editing. To install the resume-manager skill locally:

```bash
cp -r skills/resume-manager ~/.claude/skills/
```

Then in Claude Code, the `resume-manager` skill can help tailor resume bullets to job descriptions, rewrite sections, and validate your YAML.

## License

MIT
