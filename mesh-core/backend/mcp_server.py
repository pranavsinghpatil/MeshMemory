from mcp.server.fastmcp import FastMCP
from core_logic import add_note, search_notes, ask_brain

# Create an MCP server
mcp = FastMCP("MeshMemory")

@mcp.tool()
def save_memory(text: str, source: str = "user") -> str:
    """Save a note or memory to the MeshMemory brain."""
    return add_note(text, source)

@mcp.tool()
def search_memory(query: str) -> str:
    """Search for memories related to the query."""
    results = search_notes(query)
    return str(results)

@mcp.tool()
def ask_brain_tool(question: str) -> str:
    """Ask the brain a question based on stored memories."""
    return ask_brain(question)

if __name__ == "__main__":
    mcp.run()
