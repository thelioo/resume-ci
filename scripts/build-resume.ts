import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { z } from 'zod';

const root = process.cwd();
const latexDir = path.join(root, 'data/output/latex');
const templatePath = path.join(root, 'templates/output/latex/curriculo_template.tex');
const dataPath = path.join(latexDir, 'resume-data.yml');
const beginDocument = '\\begin{document}';
const endDocument = '\\end{document}';

const periodSchema = z.object({ from: z.string().min(1), to: z.string().min(1) });
const entrySchema = z.object({
  company: z.string().min(1),
  period: periodSchema,
  role: z.string().min(1),
  url: z.url(),
  bullets: z.array(z.string().min(1)).min(1),
});
const resumeSchema = z.object({
  personal: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    email: z.email(),
    linkedin_url: z.url(),
    github_url: z.url(),
  }),
  experience: z.array(entrySchema).min(1),
  projects: z.array(entrySchema),
  skills: z.array(z.object({ label: z.string().min(1), items: z.string().min(1) })).min(1),
  education: z.array(z.object({
    institution: z.string().min(1),
    period: periodSchema,
    degree: z.string().min(1),
    location: z.string().min(1),
  })).min(1),
  output_filename: z.string().regex(/^[A-Za-z0-9_-]+$/),
});

type ResumeData = z.infer<typeof resumeSchema>;

function urlToDisplay(url: string) {
  return url.replace(/^https?:\/\//, '');
}

function urlToDomain(url: string) {
  const hostname = new URL(url).hostname;
  const parts = hostname.split('.');
  const minParts = /\.(com|org|net|gov|edu)\.[a-z]{2}$/.test(hostname) ? 3 : 2;
  return parts.length > minParts ? parts.slice(-minParts).join('.') : hostname;
}

function richToLatex(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}')
    .replace(/_(.+?)_/g, '\\textit{$1}');
}

function get(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((cur, part) => (
    cur && typeof cur === 'object' ? (cur as Record<string, unknown>)[part] : undefined
  ), obj);
}

function value(ctx: Record<string, unknown>, key: string): string {
  const val = get(ctx, key.trim());
  return val == null ? '' : String(val);
}

function render(template: string, ctx: Record<string, unknown>): string {
  return template
    .replace(/\{\{\?(\w+)\}\}([\s\S]*?)\{\{\?\/\1\}\}/g, (_match: string, key: string, block: string) => {
      const val = get(ctx, key);
      return (Array.isArray(val) ? val.length > 0 : Boolean(val)) ? render(block, ctx) : '';
    })
    .replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_match: string, key: string, block: string) => {
      const val = get(ctx, key);
      if (!Array.isArray(val)) return '';
      return val.map((item) => (
        typeof item === 'string'
          ? block.replace(/\{\{\.\}\}/g, item)
          : render(block, { ...ctx, ...(item as Record<string, unknown>) })
      )).join('');
    })
    .replace(/\{\{\{([^}]+)\}\}\}/g, (_match: string, key: string) => `{${value(ctx, key)}}`)
    .replace(/\{\{([^#/?{][^}]*)\}\}/g, (_match: string, key: string) => value(ctx, key));
}

function context(data: ResumeData): Record<string, unknown> {
  const mapEntry = (entry: ResumeData['experience'][number]) => ({
    ...entry,
    period: `${entry.period.from} -- ${entry.period.to}`,
    domain: urlToDomain(entry.url),
    bullets: entry.bullets.map(richToLatex),
  });

  return {
    ...data,
    personal: {
      ...data.personal,
      linkedin_display: urlToDisplay(data.personal.linkedin_url),
      github_display: urlToDisplay(data.personal.github_url),
    },
    experience: data.experience.map(mapEntry),
    projects: data.projects.map(mapEntry),
    education: data.education.map((ed) => ({ ...ed, period: `${ed.period.from} -- ${ed.period.to}` })),
  };
}

const parsed = resumeSchema.safeParse(parse(fs.readFileSync(dataPath, 'utf8')));
if (!parsed.success) {
  parsed.error.issues.forEach((issue) => console.error(`${issue.path.join('.')}: ${issue.message}`));
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
const begin = template.indexOf(beginDocument);
const end = template.indexOf(endDocument);
if (begin === -1 || end === -1) throw new Error('Template sem begin/end document.');

const outputName = parsed.data.output_filename;
const texPath = path.join(latexDir, `${outputName}.tex`);
const pdfPath = path.join(latexDir, `${outputName}.pdf`);
const body = render(template.slice(begin + beginDocument.length, end), context(parsed.data));

fs.writeFileSync(texPath, `${template.slice(0, begin)}${beginDocument}${body}${endDocument}\n`);

try {
  execFileSync('pdflatex', ['-interaction=nonstopmode', '-output-directory', latexDir, texPath], { stdio: 'inherit' });
} catch {
  if (!fs.existsSync(pdfPath)) process.exit(1);
}

if (!fs.existsSync(pdfPath)) throw new Error(`PDF nao gerado: ${pdfPath}`);
for (const ext of ['aux', 'log', 'out']) {
  fs.rmSync(path.join(latexDir, `${outputName}.${ext}`), { force: true });
}

console.log(`PDF gerado: ${pdfPath}`);
