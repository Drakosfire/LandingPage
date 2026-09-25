const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const required = [
  'README.md',
  '.cursorrules',
  'Docs/README.md',
  'Docs/Plans/README.md',
  'Docs/Plans/ANCHOR-dungeonmind-net-platform-refresh.md',
  'Docs/Design/AUDIT-dungeonmind-web-current-debt.md',
  'Docs/Design/CARDGENERATOR-PERSISTENCE.md',
  'Docs/Reports/REPORT-document-authority-audit-2026-09-25.md',
  'src/components/CardGenerator/README.md',
  'src/components/PlayerCharacterGenerator/README.md',
];

const forbidden = [
  'specs',
  'docs',
  'HANDOFF-Page-Centering-Investigation.md',
  'HANDOFF-UnifiedHeader-Drawer-Behavior.md',
  'CardGenerator_Next_Steps.md',
  'CHARACTER_GENERATOR_ICON_DESCRIPTION.md',
  'pcg_run_logs',
  'debug-component-10.js',
];

const missing = required.filter((relative) => !fs.existsSync(path.join(root, relative)));
const resurrected = forbidden.filter((relative) => fs.existsSync(path.join(root, relative)));

if (missing.length || resurrected.length) {
  if (missing.length) {
    console.error('Missing current documentation authority:');
    for (const item of missing) console.error(`  - ${item}`);
  }
  if (resurrected.length) {
    console.error('Historical/debug path returned to active root:');
    for (const item of resurrected) console.error(`  - ${item}`);
  }
  process.exit(1);
}

console.log('PASS: DungeonMind Web documentation authority is structurally intact.');
