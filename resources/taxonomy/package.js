// Simple Node.js script to package the UNESCO Thesaurus Explorer
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(outputDir, 'unesco-thesaurus-explorer.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Highest compression level
});

// Listen for errors
output.on('close', function() {
    console.log(`Package created successfully: ${archive.pointer()} total bytes`);
    console.log('The package has been finalized and the output file descriptor has been closed.');
});

archive.on('error', function(err) {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files to the archive
const files = [
    'thesaurus-explorer.html',
    'thesaurus-explorer.css',
    'thesaurus-explorer.js',
    'skos-parser.js',
    'README.md'
];

files.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        archive.file(path.join(__dirname, file), { name: file });
    } else {
        console.warn(`Warning: File not found: ${file}`);
    }
});

// Include a sample data file or placeholder
const sampleDataPath = path.join(__dirname, 'sample-data');
if (fs.existsSync(sampleDataPath)) {
    archive.directory(sampleDataPath, 'sample-data');
} else {
    // Create a placeholder README for the TTL file
    const ttlReadmePath = path.join(outputDir, 'ttl-readme.txt');
    fs.writeFileSync(
        ttlReadmePath,
        'Place your UNESCO Thesaurus TTL file here and rename it to "unesco-thesaurus.ttl".\n' +
        'You can download the UNESCO Thesaurus from http://vocabularies.unesco.org/browser/thesaurus/en/'
    );
    archive.file(ttlReadmePath, { name: 'unesco-thesaurus.ttl.README.txt' });
}

// Finalize the archive
archive.finalize();