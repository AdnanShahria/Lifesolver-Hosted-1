# Agent Tools Documentation

Below is a comprehensive list of all the tools I have access to by default, including the Codebase Memory MCP tools, along with their descriptions.

## 1. ask_permission
Use this tool to ask for permission after a failure due to insufficient permissions, specifically when you need additional permissions for file reads or writes after a terminal command or file operation encounters a permission error.

## 2. ask_question
Use this tool to ask the user one or more multiple-choice questions, with the goal of clarifying underspecified requirements, soliciting design feedback, or picking a solution from a list of options.

## 3. browser_subagent
Start a browser subagent to perform actions in the browser with the given task description. The subagent has access to tools for both interacting with web page content (clicking, typing, navigating, etc) and controlling the browser window itself.

## 4. generate_image
Generate an image or edit existing images based on a text prompt. The resulting image will be saved as an artifact for use. You can use this tool to generate user interfaces and iterate on a design.

## 5. grep_search
Use ripgrep to find exact pattern matches within files or directories. Results are returned in JSON format. Use the Includes option to filter by file type or specific paths to refine your search.

## 6. list_dir
List the contents of a directory, i.e. all files and subdirectories that are children of the directory. Directory path must be an absolute path to a directory that exists.

## 7. list_permissions
Use this tool to list all current permission grants. This helps you understand what resources you can access without prompting.

## 8. manage_task
Manage background tasks. Use this tool to list running tasks or interact with tasks that were sent to the background. Actions include: list, kill, status, send_input.

## 9. multi_replace_file_content
Use this tool to edit an existing file when making MULTIPLE, NON-CONTIGUOUS edits to the same file (i.e., changing more than one separate block of text).

## 10. read_url_content
Fetch content from a URL via HTTP request (invisible to USER). Converts HTML to markdown. No JavaScript execution, no authentication.

## 11. replace_file_content
Use this tool to edit an existing file when making a SINGLE CONTIGUOUS block of edits to the same file (i.e. replacing a single contiguous block of text).

## 12. run_command
PROPOSE a command to run on behalf of the user. Operating System: windows. Shell: powershell. Note that the user will have to approve the command before it is executed.

## 13. schedule
Schedule a one-shot timer or a recurring cron job that sends notifications in the background. Does not pause execution.

## 14. search_web
Performs a web search for a given query. Returns a summary of relevant information along with URL citations.

## 15. view_file
View the contents of a file from the local filesystem. Supports text files and some binary files (image, pdf, video, audio).

## 16. write_to_file
Use this tool to create new files. The file and any parent directories will be created for you if they do not already exist. Can optionally overwrite existing files.

## 17. get_architecture
Returns a high-level overview of languages, packages, entry points, routes, hotspots, boundaries, layers, and clusters.

## 18. manage_adr
Manages Architecture Decision Records (ADRs) to persist architectural choices across chat sessions.

## 19. detect_changes
Maps uncommitted Git changes to affected symbols with risk classification (Impact Analysis).

## 20. trace_path
Resolves function call chains (inbound or outbound) across files and packages.

## 21. semantic_query
Vector search across the graph. Powered by local Nomic embeddings. Use to find conceptually similar code without exact keyword matches.

## 22. search_graph
Structural search using regex name patterns, label filters, and min/max degree (e.g., finding all functions named *Handler with high complexity).

## 23. search_code
Graph-augmented text search (grep) limited over indexed files.

## 24. find_dead_code
Scans the entire graph to find functions or variables with zero callers (excluding entry points).

## 25. execute_cypher
Allows raw graph database queries. E.g., `MATCH (f:Function)-[:CALLS]->(g) WHERE f.name = 'main' RETURN g.name`

## 26. link_services
Detects and maps cross-service HTTP requests (matching a frontend fetch to a backend route).

## 27. detect_channels
Detects Socket.IO, EventEmitter, and pub/sub patterns across multiple languages.

## 28. get_node_details
Retrieves comprehensive structural information about a specific file or symbol node.

## 29. compare_nodes
Uses Jaccard scoring and MinHash to find near-clone detection between functions.

## 30. index_repository
Forces a manual re-index of the repository.
