const fs = require('fs');

const input = fs.readFileSync('./data/tourism_data.csv', 'utf8');
const lines = input.split('\n');

const fixed = lines.map(line => {
  const parts = line.split(';');

  if (parts.length >= 12) {
    // Misalnya description di index ke-2 dan content di index ke-11
    parts[2] = `"${parts[2].replace(/"/g, '""')}"`;
    parts[11] = `"${parts[11].replace(/"/g, '""')}"`;
  }

  return parts.join(';');
});

fs.writeFileSync('tourism_data_fixed.csv', fixed.join('\n'), 'utf8');
console.log('✅ File tourism_data_fixed.csv berhasil dibuat.');
