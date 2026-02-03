#!/usr/bin/env node

/**
 * Upload Cobalt CSV data directly to Supabase
 */

const fs = require('fs');
const https = require('https');

const API_URL = 'https://api.gulfcoastradar.com/api/businesses/bulk';
const CSV_FILE = './cobalt_master_all_data_with_events.csv';

console.log('🚀 Starting Cobalt data upload to Supabase...\n');

// Read CSV file
let csvContent;
try {
  csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  console.log(`✅ CSV file loaded: ${csvContent.length} characters`);
} catch (error) {
  console.error('❌ Failed to read CSV file:', error.message);
  process.exit(1);
}

// Parse CSV to businesses (simplified parser)
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');

  const businesses = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = parseCSVLine(line);
    const recordType = values[0];
    const businessId = values[1];

    if (!businesses.has(businessId)) {
      businesses.set(businessId, {
        id: businessId,
        name: values[2],
        location: values[3],
        state: values[4],
        address: values[6],
        phone: values[7],
        website: values[9],
        description: values[10],
        tags: values[11] ? values[11].split(',').map(t => t.trim()) : [],
        category: 'restaurants',
        menus: {},
        specials: [],
        events: [],
        policies: [],
        happyHourSpecials: []
      });
    }

    const business = businesses.get(businessId);

    // Handle different record types
    if (recordType === 'SERVICE_WINDOW') {
      const windowName = values[15];
      const isSpecial = values[16] === 'TRUE';
      const specialType = values[17];

      if (specialType === 'sunset_specials') {
        business.specials.push({
          name: '🌅 ' + windowName,
          description: 'Special early dinner pricing during golden hour',
          day: values[12] || 'Daily',
          time: `${values[13]} – ${values[14]}`,
          schedule: `${values[12] || 'Daily'} ${values[13]} – ${values[14]}`
        });
      } else if (specialType === 'happy_hour') {
        business.happyHour = `${values[12]} ${values[13]} – ${values[14]}`;
      }
    }

    if (recordType === 'EVENT') {
      business.events.push({
        name: values[46],
        description: values[51] || '',
        day: values[49] || '',
        time: `${values[48]} – ${values[49]}` || ''
      });
    }

    if (recordType === 'MENU_ITEM') {
      const mealPeriod = values[20] || 'DINNER';
      const sectionName = values[22];
      const itemName = values[25];
      const itemDescription = values[26];
      const price = values[27];

      if (!business.menus[mealPeriod.toLowerCase()]) {
        business.menus[mealPeriod.toLowerCase()] = {
          name: mealPeriod,
          sections: {}
        };
      }

      const sectionKey = sectionName.toLowerCase().replace(/\s+/g, '_');
      if (!business.menus[mealPeriod.toLowerCase()].sections[sectionKey]) {
        business.menus[mealPeriod.toLowerCase()].sections[sectionKey] = {
          name: sectionName,
          items: []
        };
      }

      business.menus[mealPeriod.toLowerCase()].sections[sectionKey].items.push({
        name: itemName,
        description: itemDescription,
        price: price
      });
    }
  }

  return Array.from(businesses.values());
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

console.log('\n📊 Parsing CSV...');
const businesses = parseCSV(csvContent);
console.log(`✅ Parsed ${businesses.length} business(es)`);

if (businesses.length > 0) {
  const biz = businesses[0];
  console.log(`\n📋 Business: ${biz.name}`);
  console.log(`   Menus: ${Object.keys(biz.menus).length}`);
  console.log(`   Specials: ${biz.specials.length}`);
  console.log(`   Events: ${biz.events.length}`);
}

// Send to Supabase
console.log(`\n🚀 Sending to Supabase API: ${API_URL}`);

const postData = JSON.stringify({ businesses });

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(API_URL, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('\n✅ SUCCESS! Data uploaded to Supabase!');
      console.log(`Response: ${data}`);
    } else {
      console.error(`\n❌ Upload failed with status ${res.statusCode}`);
      console.error(`Response: ${data}`);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request error:', error.message);
});

req.write(postData);
req.end();
