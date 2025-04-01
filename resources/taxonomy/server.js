/**
 * Simple local server for testing the UNESCO Thesaurus Explorer
 * This avoids CORS issues when loading local files
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.ttl': 'text/turtle',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
    // Get the file path from the URL
    let filePath = path.join(__dirname, req.url === '/' ? 'thesaurus-explorer.html' : req.url);
    
    // If the path doesn't include a file extension, assume it's a directory and look for index.html
    if (!path.extname(filePath)) {
        filePath = path.join(filePath, 'index.html');
    }
    
    // Get the file extension
    const extname = path.extname(filePath);
    
    // Set the content type based on the file extension
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    // Read the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                console.log(`File not found: ${filePath}`);
                res.writeHead(404);
                res.end('404 - File Not Found');
            } else {
                // Server error
                console.error(`Server error: ${err.code}`);
                res.writeHead(500);
                res.end(`500 - Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser to http://localhost:${PORT}/ to view the UNESCO Thesaurus Explorer`);
});