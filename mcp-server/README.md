# MCP Server for PDF Content

This server provides an API endpoint to access the textual content of PDF files stored in the `resource` directory.

## Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)

## Setup

1.  **Navigate to the server directory:**
    ```bash
    cd mcp-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Add PDF files:**
    Place your PDF files into the `mcp-server/resource` directory. If this directory doesn't exist, create it.

## Running the Server

To start the server, run the following command from the `mcp-server` directory:

```bash
npm start
```

The server will start, typically on `http://localhost:3000` (or the port specified by the `PORT` environment variable).

## API Endpoint

-   **GET `/api/content`**

    Retrieves the combined textual content of all PDF files found in the `resource` directory. Each PDF's content is separated by a line `---`.

    **Success Response (200 OK):**
    ```json
    {
      "content": "Text from PDF 1...\n\n---\n\nText from PDF 2..."
    }
    ```

    **Error Response (404 Not Found):**
    If no PDF files are found in the `resource` directory.
    ```json
    {
      "message": "No PDF files found in the resource directory."
    }
    ```

    **Error Response (500 Internal Server Error):**
    If there was an error processing the PDF files.
    ```json
    {
      "message": "Failed to process PDF files.",
      "error": "<specific error message>"
    }
    ```

## Development

-   The main server logic is in `server.js`.
-   PDF files are served from the `resource/` directory.
