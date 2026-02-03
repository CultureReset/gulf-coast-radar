const fs = require('fs');

// Read from stdin
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const json = JSON.parse(data);
  const businesses = json.businesses || [];

  console.log('Total businesses:', businesses.length);

  const hidden = businesses.filter(b =>
    b.hidden === true ||
    b.is_hidden === true ||
    b.status === 'hidden' ||
    b.visible === false
  );
  console.log('Hidden businesses:', hidden.length);

  const active = businesses.length - hidden.length;
  console.log('Active businesses:', active);

  // Check for any visibility-related fields
  const fields = new Set();
  businesses.slice(0, 10).forEach(b => {
    Object.keys(b).forEach(k => {
      if (k.includes('hidden') || k.includes('visible') || k.includes('status') || k.includes('active')) {
        fields.add(k);
      }
    });
  });

  if (fields.size > 0) {
    console.log('\nVisibility fields found:', Array.from(fields).join(', '));
  }
});
