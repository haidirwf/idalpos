const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'migrations/schema.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('schema.sql does not exist');
  process.exit(1);
}
const content = fs.readFileSync(sqlPath, 'utf8');
if (!content.includes('CREATE TABLE orders') || !content.includes('tracking_token UUID')) {
  console.error('Validation failed: Missing key fields in schema');
  process.exit(1);
}
console.log('schema.sql validated successfully');
