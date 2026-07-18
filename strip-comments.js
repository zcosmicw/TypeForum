const fs = require('fs');
const strip = require('strip-comments');
const { globSync } = require('glob');

const files = globSync('src/**/*.{ts,tsx,css}');

for (const file of files) {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const stripped = strip(code);
    if (code !== stripped) {
      fs.writeFileSync(file, stripped, 'utf8');
      console.log(`Stripped comments from ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}
console.log('Done!');
