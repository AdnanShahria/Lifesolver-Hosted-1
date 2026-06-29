function mapValue(val: any) {
  if (val === null || val === undefined) {
    return { type: "null" };
  }
  if (typeof val === "string") {
    return { type: "text", value: val };
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return { type: "integer", value: String(val) };
    }
    return { type: "float", value: val };
  }
  if (typeof val === "boolean") {
    return { type: "integer", value: val ? "1" : "0" };
  }
  return { type: "text", value: String(val) };
}

function parseRows(result: any) {
  if (!result || !result.cols || !result.rows) return [];
  const colNames = result.cols.map((c: any) => c.name);
  return result.rows.map((row: any) => {
    const obj: any = {};
    row.forEach((cell: any, i: number) => {
      const colName = colNames[i];
      let val = null;
      if (cell.type === "text") {
        val = cell.value;
      } else if (cell.type === "integer") {
        val = Number(cell.value);
      } else if (cell.type === "float") {
        val = cell.value;
      } else if (cell.type === "null") {
        val = null;
      } else {
        val = cell.value;
      }
      obj[colName] = val;
    });
    return obj;
  });
}

class TursoD1PreparedStatement {
  private sql: string;
  private args: any[];
  private url: string;
  private token: string;

  constructor(sql: string, url: string, token: string, args: any[] = []) {
    this.sql = sql;
    this.url = url;
    this.token = token;
    this.args = args;
  }

  bind(...args: any[]) {
    return new TursoD1PreparedStatement(this.sql, this.url, this.token, [...this.args, ...args]);
  }

  async run() {
    const results = await this.execute();
    return { success: true, meta: { duration: 0 }, results };
  }

  async all() {
    const results = await this.execute();
    return { results, success: true, meta: { duration: 0 } };
  }

  private async execute(): Promise<any[]> {
    const httpUrl = this.url.replace(/^libsql:\/\//, 'https://');
    const pipelineUrl = `${httpUrl}/v2/pipeline`;

    const mappedArgs = this.args.map(mapValue);

    const requests = [
      {
        type: 'execute',
        stmt: {
          sql: this.sql,
          args: mappedArgs
        }
      },
      {
        type: 'close'
      }
    ];

    const response = await fetch(pipelineUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Turso D1 Shim error: HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    
    if (data.results && data.results[0] && data.results[0].type === 'error') {
      throw new Error(`Turso SQL error: ${data.results[0].error.message}`);
    }

    const result = data.results?.[0]?.response?.result;
    return parseRows(result);
  }
}

export class TursoD1Database {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  prepare(sql: string) {
    return new TursoD1PreparedStatement(sql, this.url, this.token);
  }
}

export function createTursoD1Shim(url: string, token: string) {
  return new TursoD1Database(url, token);
}
