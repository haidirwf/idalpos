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

// Additional validations for Task 2 improvements
if (!content.includes('CREATE TRIGGER update_orders_updated_at')) {
  console.error('Validation failed: Missing update_orders_updated_at trigger');
  process.exit(1);
}

if (!content.includes('CREATE INDEX idx_order_items_order_id')) {
  console.error('Validation failed: Missing idx_order_items_order_id index');
  process.exit(1);
}

if (!content.includes('USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id))')) {
  console.error('Validation failed: Missing or incorrect RLS select policy for order_items');
  process.exit(1);
}

console.log('schema.sql validated successfully');

