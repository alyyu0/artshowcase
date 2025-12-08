const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'iconv-lite', 'lib', 'helpers', 'merge-exports.js');

console.log('Checking iconv-lite helper file:', target);

if (fs.existsSync(target)) {
  console.log('OK: merge-exports.js exists.');
  process.exit(0);
}

console.error('Missing: iconv-lite helper "merge-exports.js" not found.');
console.log('');
console.log('Suggested fixes (run from c:\\Users\\alyss\\artshowcase\\backend):');
console.log('  1) Delete node_modules and package-lock.json, then reinstall:');
console.log('       rm -Recurse -Force node_modules');
console.log('       rm package-lock.json');
console.log('       npm cache clean --force');
console.log('       npm install');
console.log('');
console.log('  2) If still failing, try installing a stable iconv-lite version and rebuild:');
console.log('       npm install iconv-lite@0.6.3');
console.log('       npm rebuild');
console.log('');
console.log('You can also run this script with --fix to attempt step 2 automatically.');

if (process.argv.includes('--fix')) {
  try {
    console.log('\nAttempting automatic fix: installing iconv-lite@0.6.3 ...');
    execSync('npm install iconv-lite@0.6.3', { stdio: 'inherit' });
    console.log('\nRunning npm rebuild ...');
    execSync('npm rebuild', { stdio: 'inherit' });

    if (fs.existsSync(target)) {
      console.log('\n✅ Fixed: merge-exports.js now present.');
      process.exit(0);
    } else {
      console.error('\n❌ Automatic fix completed but helper file still missing. Try manual steps above.');
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Automatic fix failed:', err.message);
    process.exit(1);
  }
} else {
  process.exit(1);
}
