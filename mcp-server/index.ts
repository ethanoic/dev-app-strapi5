import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import path from 'path';
import pdf from 'pdf-parse';
import fse from 'fs-extra';
import { promises as fs } from 'fs';

const resourceDir = path.join(__dirname, 'resource');

// Ensure the resource directory exists
fse.ensureDirSync(resourceDir);

// Create server instance
const server = new McpServer({
  name: "PDF",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Refactored to get text content from a specific PDF file
async function getPdfContent(requestedFileName: string): Promise<string | null> {
  try {
    const filePath = path.join(resourceDir, requestedFileName);

    // Security check: Ensure the resolved path is within the resource directory
    const resolvedFilePath = path.resolve(filePath);
    const resolvedResourceDir = path.resolve(resourceDir);
    if (!resolvedFilePath.startsWith(resolvedResourceDir)) {
      console.error(`Access denied: Attempt to access file outside of resource directory: ${requestedFileName}`);
      return null;
    }

    if (path.extname(filePath).toLowerCase() !== '.pdf') {
        console.error(`Error: File '${requestedFileName}' is not a PDF.`);
        return null;
    }

    // Check if file exists using fs.access (throws if not found or not accessible)
    try {
      await fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK);
    } catch (accessError) {
      console.error(`Error: PDF file '${requestedFileName}' not found or not accessible in '${resourceDir}'.`);
      return null;
    }

    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text; // Return only the text content
  } catch (error) {
    console.error(`Error processing PDF file '${requestedFileName}':`, error);
    return null;
  }
}

server.tool(
  "get-pdf-content",
  "Get the text content of a specific PDF file from the server's resource directory.",
  {
    file: z.string().describe("The name of the PDF file (e.g., 'document.pdf') located in the server's resource directory."),
  },
  async ({ file }): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> => {
    const textContent = await getPdfContent(file);

    if (textContent !== null && textContent.trim() !== "") {
      return {
        content: [{ type: "text", text: textContent }],
      };
    } else if (textContent === "") {
      // Handle PDFs that are empty or contain no extractable text
      return {
        content: [{ type: "text", text: `The PDF file '${file}' is empty or contains no extractable text.` }],
      };
    } else {
      // Handles null case (error, file not found, not a PDF, or not accessible)
      return {
        content: [{ type: "text", text: `Could not retrieve content for PDF file '${file}'. Ensure the file exists in the resource directory, is a readable PDF, and check server logs for more details.` }],
        isError: true,
      };
    }
  }
)

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});