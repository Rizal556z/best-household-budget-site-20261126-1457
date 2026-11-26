// Anggrek Household Budget — main.ts (Node 22, standard library only).
//
// The entry program: it hands the site in. It copies app/ and screenshots/
// from beside this file into the output directory and writes dossier.json
// there with the vendored make.fun library, so the judge reads the site's
// screenshots, its first-load files and bytes, and its source.
//
// The program runs twice in the grader and both runs must write the same
// bytes. Nothing here depends on time, randomness or the environment: the copy
// is a plain recursive copy and buildDossier is deterministic, so the two
// runs are byte-identical.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps match the gate: at most 4 screenshots, each at most 256 KiB; app/
// at most 993 files and directories and 16 MiB; the dossier text at most
// 160 KiB. buildDossier refuses anything past them, so a bad entry fails
// here, loudly, instead of passing silently.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
