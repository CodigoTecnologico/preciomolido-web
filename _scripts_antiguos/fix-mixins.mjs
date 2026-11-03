import fs from 'node:fs';
import path from 'node:path';

const S = path.join(process.cwd(), 'src/styles');

// Fix _mixins.scss — necesita @use 'variables' as *;
fs.writeFileSync(path.join(S, 'abstracts/_mixins.scss'), `@use 'variables' as *;

@mixin mobile  { @media (max-width: $bp-sm) { @content; } }
@mixin small   { @media (max-width: $bp-xs) { @content; } }
@mixin tablet  { @media (max-width: $bp-md) { @content; } }
@mixin desktop { @media (max-width: $bp-lg) { @content; } }

@mixin card {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: $shadow-sm;
  border: 1px solid var(--gray-100);
}

@mixin flex-center  { display:flex; align-items:center; justify-content:center; }
@mixin flex-between { display:flex; align-items:center; justify-content:space-between; }
`, 'utf8');
console.log('✓ _mixins.scss arreglado (con @use variables)');

// Verificar que cada partial tenga @use '../abstracts' as *;
const folders = ['base', 'components', 'layouts', 'pages'];
let problemas = 0;

for (const folder of folders) {
  const dir = path.join(S, folder);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.scss')) continue;
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    if (!content.includes("@use '../abstracts'")) {
      console.log('⚠️  Falta @use en:', folder + '/' + file);
      // Arreglar automáticamente
      fs.writeFileSync(full, "@use '../abstracts' as *;\n\n" + content, 'utf8');
      console.log('   → arreglado');
      problemas++;
    }
  }
}

if (problemas === 0) console.log('✓ Todos los partials tienen @use ../abstracts');

console.log('\n✅ Ahora ejecuta: npm run dev\n');