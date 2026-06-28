const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Adnan/Desktop/Orbit SaaS/Our/LifeSolver/apps/web/frontend/web-app/src/Database/schemas';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
let fullSql = '-- Database Schema for LifeSolver\n\n';

for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    // Simple extraction by looking for backticks
    const parts = content.split('`');
    // Typically the SQL is in the odd indices (1, 3, 5, etc) inside template literals
    for (let i = 1; i < parts.length; i += 2) {
        const sql = parts[i].trim();
        if (sql.startsWith('CREATE TABLE')) {
            fullSql += sql + ';\n\n';
        }
    }
}
fs.writeFileSync('c:/Users/Adnan/Desktop/Orbit SaaS/Our/LifeSolver/website/database/schema.sql', fullSql);
console.log('Successfully compiled schema.sql');
