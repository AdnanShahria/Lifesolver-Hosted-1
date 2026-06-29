import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read .dev.vars
const devVarsPath = path.join(__dirname, '../.dev.vars');
if (!fs.existsSync(devVarsPath)) {
    console.error('Error: .dev.vars file not found at', devVarsPath);
    process.exit(1);
}
const devVarsContent = fs.readFileSync(devVarsPath, 'utf8');

// Parse VITE_TURSO_DB_URL and VITE_TURSO_AUTH_TOKEN
let dbUrl = '';
let authToken = '';
for (const line of devVarsContent.split('\n')) {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (key === 'VITE_TURSO_DB_URL') {
            dbUrl = val;
        } else if (key === 'VITE_TURSO_AUTH_TOKEN') {
            authToken = val;
        }
    }
}

if (!dbUrl || !authToken) {
    console.error('Error: VITE_TURSO_DB_URL or VITE_TURSO_AUTH_TOKEN not found in .dev.vars');
    process.exit(1);
}

// Convert libsql:// to https://
const httpUrl = dbUrl.replace(/^libsql:\/\//, 'https://');
const pipelineUrl = `${httpUrl}/v2/pipeline`;

// 2. Read schema.sql
const schemaPath = path.join(__dirname, '../database/schema.sql');
if (!fs.existsSync(schemaPath)) {
    console.error('Error: schema.sql file not found at', schemaPath);
    process.exit(1);
}
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// 3. Parse SQL statements split by ';'
const rawStatements = schemaSql.split(';');
const statements = [];

for (const stmt of rawStatements) {
    // Remove comments line-by-line
    const lines = stmt.split('\n');
    const cleanedLines = lines.map(line => {
        const commentIndex = line.indexOf('--');
        if (commentIndex !== -1) {
            return line.substring(0, commentIndex).trimEnd();
        }
        return line;
    });
    const cleanedStmt = cleanedLines.join('\n').trim();
    if (cleanedStmt) {
        statements.push(cleanedStmt);
    }
}

console.log(`Parsed ${statements.length} SQL statements to execute.`);

// 4. Construct requests array
const requests = statements.map(sql => ({
    type: 'execute',
    stmt: { sql }
}));
// Add close request to release connection
requests.push({ type: 'close' });

// 5. Send POST request to Turso pipeline endpoint
async function run() {
    console.log(`Connecting to Turso: ${httpUrl}`);
    try {
        const response = await fetch(pipelineUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        
        // Check results
        let hasErrors = false;
        if (data.results) {
            data.results.forEach((res, index) => {
                if (res.type === 'error') {
                    console.error(`Error executing statement ${index + 1}:`, res.error);
                    console.error(`Statement was: \n${statements[index]}`);
                    hasErrors = true;
                }
            });
        }

        if (hasErrors) {
            console.error('Finished with database execution errors.');
            process.exit(1);
        } else {
            console.log('Successfully executed all database schemas on Turso!');
        }
    } catch (err) {
        console.error('Network or Execution error:', err);
        process.exit(1);
    }
}

run();
