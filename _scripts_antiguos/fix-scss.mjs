import fs from 'node:fs';
import path from 'node:path';

const BASE = process.cwd();
const S = path.join(BASE, 'src/styles');

console.log('\n🔧 Arreglando SCSS...\n');

// 1) vite.config.js SIN additionalData y con modern-compiler
fs.writeFileSync(path.join(BASE, 'vite.config.js'), `import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      '/api':       { target: 'http://localhost:3000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  build: { outDir: 'dist', sourcemap: true },
});
`, 'utf8');
console.log('✓ vite.config.js');

// 2) abstracts/_variables.scss  (todas las variables + tokens CSS)
fs.writeFileSync(path.join(S, 'abstracts/_variables.scss'), `// Colores
$primary:       #1a56db;
$primary-hover: #1e40af;
$primary-light: #e8f0fe;
$success:       #057a55; $success-light: #e6f4ea;
$danger:        #c81e1e; $danger-light:  #fde8e8;
$warning:       #b45309; $warning-light: #fef3c7;
$gray-50:#f9fafb; $gray-100:#f3f4f6; $gray-200:#e5e7eb; $gray-300:#d1d5db;
$gray-400:#9ca3af; $gray-500:#6b7280; $gray-600:#4b5563; $gray-700:#374151;
$gray-800:#1f2a37; $gray-900:#111928;
$white:#ffffff;

// Sombras
$shadow-sm: 0 1px 2px rgba(0,0,0,.05);
$shadow-md: 0 4px 6px -1px rgba(0,0,0,.1);
$shadow-lg: 0 10px 15px -3px rgba(0,0,0,.1);
$shadow-xl: 0 20px 25px -5px rgba(0,0,0,.1);

// Radios y transición
$radius:    8px;
$radius-lg: 12px;
$transition:.25s cubic-bezier(.4,0,.2,1);

// Breakpoints
$bp-lg: 1024px;
$bp-md: 900px;
$bp-sm: 768px;
$bp-xs: 480px;

// Tokens CSS runtime
:root {
  --primary:#{$primary};
  --primary-hover:#{$primary-hover};
  --primary-light:#{$primary-light};
  --success:#{$success};
  --success-light:#{$success-light};
  --danger:#{$danger};
  --danger-light:#{$danger-light};
  --warning:#{$warning};
  --warning-light:#{$warning-light};
  --gray-50:#{$gray-50}; --gray-100:#{$gray-100}; --gray-200:#{$gray-200};
  --gray-300:#{$gray-300}; --gray-400:#{$gray-400}; --gray-500:#{$gray-500};
  --gray-600:#{$gray-600}; --gray-700:#{$gray-700}; --gray-800:#{$gray-800};
  --gray-900:#{$gray-900}; --white:#{$white};
  --radius:#{$radius}; --radius-lg:#{$radius-lg};
  --transition:#{$transition};
}

[data-theme="dark"] {
  --gray-50:#111928; --gray-100:#1f2a37; --gray-200:#374151; --gray-300:#4b5563;
  --gray-400:#6b7280; --gray-500:#9ca3af; --gray-600:#d1d5db; --gray-700:#e5e7eb;
  --gray-800:#f3f4f6; --gray-900:#f9fafb; --white:#1f2a37;
  --primary-light:#1e3a8a;
  --success-light:#064e3b;
  --danger-light:#7f1d1d;
  --warning-light:#78350f;
}
`, 'utf8');
console.log('✓ abstracts/_variables.scss');

// 3) abstracts/_mixins.scss
fs.writeFileSync(path.join(S, 'abstracts/_mixins.scss'), `@mixin mobile { @media (max-width: $bp-sm) { @content; } }
@mixin small  { @media (max-width: $bp-xs) { @content; } }
@mixin tablet { @media (max-width: $bp-md) { @content; } }
@mixin card {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: $shadow-sm;
  border: 1px solid var(--gray-100);
}
@mixin flex-center { display:flex; align-items:center; justify-content:center; }
@mixin flex-between { display:flex; align-items:center; justify-content:space-between; }
`, 'utf8');
console.log('✓ abstracts/_mixins.scss');

// 4) abstracts/_index.scss
fs.writeFileSync(path.join(S, 'abstracts/_index.scss'), `@forward 'variables';
@forward 'mixins';
`, 'utf8');
console.log('✓ abstracts/_index.scss');

// 5) Prepend @use '../abstracts' as *; a TODOS los partials (excepto abstracts)
const USE_LINE = `@use '../abstracts' as *;\n`;
const folders = ['base', 'components', 'layouts', 'pages'];

for (const folder of folders) {
  const dir = path.join(S, folder);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.scss')) continue;
    const full = path.join(dir, file);
    let content = fs.readFileSync(full, 'utf8');
    // Quitar @use previos (evita duplicados)
    content = content.replace(/@use\s+["'][^"']*abstracts[^"']*["']\s+as\s+\*;\s*\n?/g, '');
    content = content.replace(/@use\s+["'][^"']*abstracts[^"']*["'];\s*\n?/g, '');
    fs.writeFileSync(full, USE_LINE + content, 'utf8');
    console.log('  ✓', folder + '/' + file);
  }
}

// 6) main.scss SIN @use adicional (los partials ya lo traen)
fs.writeFileSync(path.join(S, 'main.scss'), `@use 'base/reset';
@use 'base/typography';
@use 'layouts/header';
@use 'layouts/footer';
@use 'layouts/panels';
@use 'components/button';
@use 'components/form';
@use 'components/card';
@use 'components/modal';
@use 'components/toast';
@use 'components/table';
@use 'components/ad';
@use 'pages/dashboard';
@use 'pages/marketplace';
@use 'pages/cuenta';
@use 'pages/admin';
`, 'utf8');
console.log('✓ main.scss');

// 7) Borrar rating.js si existe (no se usa)
const r = path.join(BASE, 'src/ui/components/rating.js');
if (fs.existsSync(r)) { fs.unlinkSync(r); console.log('✓ rating.js eliminado'); }

console.log('\n✅ Fix aplicado. Ejecuta: npm run dev\n');