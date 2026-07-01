# Custom Agent Rules for LifeSolver

## Codebase Memory MCP CLI Fallback
If the native `codebase-memory-mcp` server tools (like `get_architecture`, `search_graph`, `trace_path`, etc.) are not active or registered as tool declarations in the current session, ALWAYS execute them via the CLI using the `run_command` tool.

### CLI Syntax
```powershell
codebase-memory-mcp cli <tool_name> '<json_arguments>'
```

### Examples
- **Get Architecture:**
  ```powershell
  codebase-memory-mcp cli get_architecture '{"project": "C-Users-Adnan-Desktop-Orbit-SaaS-Our-LifeSolver"}'
  ```
- **Search Graph (Regex matching symbols):**
  ```powershell
  codebase-memory-mcp cli search_graph '{"project": "C-Users-Adnan-Desktop-Orbit-SaaS-Our-LifeSolver", "name_pattern": ".*Habit.*"}'
  ```
- **Trace Inbound/Outbound Calls:**
  ```powershell
  codebase-memory-mcp cli trace_path '{"project": "C-Users-Adnan-Desktop-Orbit-SaaS-Our-LifeSolver", "name": "createTask", "direction": "inbound"}'
  ```

Always default to this CLI approach first for structural and architectural codebase queries instead of performing heavy text-based grep searches.
