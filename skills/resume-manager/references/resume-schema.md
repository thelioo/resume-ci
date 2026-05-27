# Resume YAML Schema

Use this schema for every resume data file.

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
  education: string
  skills: string

experience:
  - company: string
    period:
      from: string
      to: string
    role: string
    url: string
    bullets:
      - string

projects:
  - company: string
    period:
      from: string
      to: string
    role: string
    url: string
    bullets:
      - string

education:
  - institution: string
    period:
      from: string
      to: string
    degree: string
    location: string

skills:
  - label: string
    items: string

output_filename: string
```

## Notes

- `projects: []` hides the Projects section.
- `output_filename` may contain only letters, digits, `_`, and `-`.
- `font` defaults to `lmodern` if omitted.
- LinkedIn and GitHub display labels are derived from the URL path, but the full URL remains the hyperlink target.
- Skills are intentionally rendered last as ATS keywords.

## Rich Text Markers

Use lightweight markers in YAML content:

| Marker | Rendered As |
|---|---|
| `**text**` | `\textbf{text}` |
| `_text_` | `\textit{text}` |

Do not put raw LaTeX commands in YAML content unless the user explicitly accepts the risk.

## Dependencies

The bundled builder expects:

- Python 3.10+
- PyYAML
- A LaTeX distribution with `pdflatex`
- LaTeX packages used by the template: `geometry`, `titlesec`, `enumitem`, `fancyhdr`, `hyperref`, `tabularx`, `fontawesome5`, and the selected font package

Install PyYAML if needed:

```bash
python3 -m pip install PyYAML
```
