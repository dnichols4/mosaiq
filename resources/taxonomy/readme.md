# UNESCO Thesaurus SKOS Explorer

This project implements a robust parser and explorer for SKOS-based thesauri, specifically designed for the UNESCO Thesaurus. It correctly parses and displays the hierarchical structure of domains, microthesauri, and concepts using the rdflib.js library for RDF/SKOS parsing.

## Features

- **Robust SKOS Parsing**: Uses rdflib.js to properly parse SKOS structures from Turtle (TTL) files
- **Complete Hierarchy Display**: Correctly displays the three-tier hierarchy (domains, microthesauri, concepts)
- **Concept Details**: Shows comprehensive information about selected concepts
- **Multi-language Support**: Displays labels in different languages based on user selection
- **Search Functionality**: Allows searching through concepts by label
- **Interactive Navigation**: Easy expansion/collapse of hierarchy nodes
- **Relationship Exploration**: Displays broader, narrower, and related concepts with clickable links

## Installation

1. Download the package and extract it to your web server or local directory
2. Make sure you have a UNESCO Thesaurus TTL file (or any SKOS thesaurus in TTL format)
3. Rename your file to `unesco-thesaurus.ttl` and place it in the same directory as the HTML file
4. Open the HTML file in a web browser

## File Structure

- `thesaurus-explorer.html`: Main HTML file
- `thesaurus-explorer.css`: CSS styles for the explorer
- `skos-parser.js`: Core SKOS parsing logic using rdflib.js
- `thesaurus-explorer.js`: UI integration and interaction handling
- `unesco-thesaurus.ttl`: Your UNESCO Thesaurus file (not included, you need to provide this)

## Requirements

- Modern web browser with JavaScript enabled
- Internet connection for loading CDN libraries (jQuery and rdflib.js)
- UNESCO Thesaurus in TTL format

## Usage

1. Open `thesaurus-explorer.html` in a web browser
2. The parser will load and analyze the thesaurus file
3. Once loaded, you can:
   - Expand/collapse domains and microthesauri using the + and - buttons
   - Click on any concept to view its details in the right panel
   - Use the search box to find concepts by label
   - Change the display language using the language selector
   - Navigate between related concepts using the links in the details panel

## How It Works

The implementation follows a three-step process:

1. **Parsing**: The SKOS parser loads and parses the TTL file into an RDF graph using rdflib.js
2. **Analysis**: The parser identifies the concept scheme, domains, microthesauri, and concepts, and extracts their relationships
3. **Rendering**: The UI renders the hierarchical tree and provides interactive features for exploration

## SKOS Structure Support

The parser supports standard SKOS elements and relationships:

- `skos:ConceptScheme`: The thesaurus itself
- `skos:Concept`: Individual concepts in the thesaurus
- `skos:broader`/`skos:narrower`: Hierarchical relationships
- `skos:related`: Associative relationships
- `skos:prefLabel`/`skos:altLabel`: Concept labels
- `skos:definition`/`skos:scopeNote`: Concept definitions and scope notes
- `skos:inScheme`: Concept membership in a scheme
- `skos:hasTopConcept`/`skos:topConceptOf`: Top-level concepts (domains)

Additionally, the parser handles UNESCO-specific patterns like domain and microthesaurus URI patterns.

## Customization

You can customize the explorer by:

- Modifying the CSS file to change the appearance
- Adjusting the parsing logic in `skos-parser.js` to handle different SKOS structures
- Adding additional functionality to the UI in `thesaurus-explorer.js`

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages
2. Ensure your TTL file is valid and follows SKOS conventions
3. Check if your file uses custom namespaces or non-standard SKOS extensions
4. For large thesauri, be aware that parsing may take some time

### Common Issues and Solutions

#### "rdflib.js library is not loaded" Error

This error occurs when the rdflib.js library fails to load properly before the SKOS parser tries to use it. Solutions:

1. **Use the included local server**: Run `npm install` and then `npm start` to launch a local server that properly handles the loading order of scripts
2. **Check your internet connection**: The library is loaded from a CDN, so an internet connection is required
3. **Try a different browser**: Some browsers may have stricter security settings that prevent loading the library correctly
4. **Use a proper web server**: Loading the files directly from the filesystem without a server can cause issues with script loading order
5. **Check the dependency status**: The application includes a dependency checker that will show you which libraries failed to load

## Credits

This implementation is based on the design document "UNESCO Thesaurus Parser Implementation Proposal" and utilizes:

- [rdflib.js](https://github.com/linkeddata/rdflib.js/) for RDF/SKOS parsing
- [jQuery](https://jquery.com/) for DOM manipulation
- [UNESCO Thesaurus](http://vocabularies.unesco.org/browser/thesaurus/en/) as the reference model

## License

This code is provided under the MIT License. Feel free to use, modify, and distribute it according to your needs.

---

*Note: This implementation is designed to be integrated into the Mosaiq Knowledge & Learning Management Application as specified in the project documentation.*