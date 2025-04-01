# UNESCO Thesaurus Parser Implementation Proposal

## 1\. Problem Statement

The current implementation of the UNESCO Thesaurus Explorer fails to properly parse the SKOS-based structure, resulting in incorrect identification of hierarchical elements. The explorer currently reports finding only 1 domain and 1 concept, when the UNESCO Thesaurus contains multiple domains, microthesauri, and concepts organized in a three-tier hierarchy.

## 2\. Proposed Solution

Implement a robust SKOS parser using the rdflib.js library to correctly identify and organize the hierarchical structure of the UNESCO Thesaurus.

## 3\. Technical Approach

### 3.1 Library Selection: rdflib.js

[rdflib.js](https://github.com/linkeddata/rdflib.js/) is a JavaScript library designed specifically for parsing and manipulating RDF data, including SKOS vocabularies in Turtle (TTL) format. It provides several advantages:

*   Native support for Turtle format
*   Built-in understanding of RDF graph structures
*   Ability to query the graph using SPARQL-like patterns
*   Mature library with strong community support

### 3.2 Implementation Architecture

#### 3.2.1 Core Components

**RDF Graph Manager**

*   Responsible for loading and parsing the TTL file
*   Creates an in-memory graph representation
*   Provides query methods for traversing the graph

**SKOS Structure Extractor**

*   Identifies concept schemes, domains, microthesauri, and concepts
*   Extracts hierarchical relationships
*   Builds the three-tier structure

**UI Renderer**

*   Converts the extracted structure into a hierarchical tree
*   Handles user interaction (expanding/collapsing nodes)
*   Displays concept details

#### 3.2.2 Processing Flow

1.  Load TTL file using rdflib.js
2.  Identify the main concept scheme (the thesaurus itself)
3.  Extract top concepts (domains) using SKOS relationships
4.  For each domain, identify related microthesauri
5.  For each microthesaurus, extract associated concepts
6.  Build a hierarchical data structure
7.  Render the tree view and detail panels

### 3.3 SKOS Extraction Logic

The following SKOS relationships and patterns will be used to extract the hierarchy:

**Identifying Concept Scheme**:

*   `?scheme a skos:ConceptScheme`

**Extracting Domains (Top Concepts)**:

*   `?scheme skos:hasTopConcept ?domain`
*   `?domain skos:topConceptOf ?scheme`
*   Also look for UNESCO-specific domain patterns (e.g., `:domain1`)

**Extracting Microthesauri**:

*   `?microthesaurus a skos:Collection` or `?microthesaurus a skos-thes:MicroThesaurus`
*   Look for UNESCO-specific microthesaurus patterns (e.g., `:mt1.05`)
*   `?microthesaurus skos:broader ?domain` (for hierarchical relationship)

**Extracting Concepts**:

*   `?concept a skos:Concept`
*   `?concept skos:broader ?microthesaurus` (for hierarchical relationship)
*   `?concept skos:inScheme ?scheme` (to confirm association with the thesaurus)

**Extracting Labels and Metadata**:

*   `?entity skos:prefLabel ?label`
*   `?entity skos:altLabel ?altLabel`
*   `?entity skos:definition ?definition`
*   `?entity skos:scopeNote ?note`

### 3.4 UNESCO-Specific Patterns

The UNESCO Thesaurus has unique URI patterns that should be specifically handled:

*   Domains: URIs like `:domain1`, `:domain2`, etc.
*   Microthesauri: URIs like `:mt1.05`, `:mt2.10`, etc. (where the first digit usually corresponds to the domain number)
*   Concepts: URIs like `:concept1234`

## 4\. Example Implementation Sketches

### 4.1 Loading and Parsing the TTL File

```javascript
// This is a conceptual example, not actual implementation code
function loadThesaurus(ttlContent) {
  const store = $rdf.graph();
  const parser = new $rdf.Parser();
  
  try {
    // Parse the TTL content into the RDF store
    parser.parse(ttlContent, store, 'http://vocabularies.unesco.org/thesaurus', 'text/turtle');
    return store;
  } catch (error) {
    console.error('Error parsing TTL file:', error);
    throw new Error('Failed to parse thesaurus file');
  }
}
```

### 4.2 Extracting the Concept Scheme

```javascript
// This is a conceptual example, not actual implementation code
function findConceptScheme(store) {
  const SKOS = $rdf.Namespace('http://www.w3.org/2004/02/skos/core#');
  const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
  
  // Find nodes that are explicitly typed as ConceptScheme
  const schemes = store.each(null, RDF('type'), SKOS('ConceptScheme'));
  
  if (schemes.length > 0) {
    return schemes[0]; // Return the first concept scheme
  }
  
  // Fallback: Look for nodes that have topConcepts
  const schemesWithTopConcepts = store.each(null, SKOS('hasTopConcept'), null);
  if (schemesWithTopConcepts.length > 0) {
    return schemesWithTopConcepts[0];
  }
  
  // If still not found, use a default URI for UNESCO thesaurus
  return $rdf.sym('http://vocabularies.unesco.org/thesaurus');
}
```

## 5\. Implementation Strategy

### 5.1 Phase 1: Core Parsing Logic

1.  Implement the RDF Graph Manager using rdflib.js
2.  Create the SKOS Structure Extractor
3.  Develop test cases using sample UNESCO TTL data
4.  Validate correct identification of domains, microthesauri, and concepts

### 5.2 Phase 2: UI Integration

1.  Connect the parser to the existing tree view UI
2.  Implement node expansion/collapse functionality
3.  Create the detail panel renderer
4.  Add search and filtering capabilities

### 5.3 Phase 3: Enhanced Features

1.  Add support for related concepts and associative relationships
2.  Implement multi-language support for labels
3.  Create visualization options for concept relationships
4.  Add export functionality for selected branches

## 6\. Compatibility Considerations

The implementation should maintain compatibility with the existing HTML structure and CSS, but the JavaScript implementation will be largely replaced. The new implementation will:

1.  Use the same DOM element IDs and structure
2.  Maintain the existing UI appearance and behavior
3.  Support the same user interactions (clicking, expanding/collapsing)
4.  Provide the same or enhanced information in the details panel

## 7\. Advantages Over Current Implementation

1.  **Standards Compliance**: Uses a dedicated RDF/SKOS parser for more accurate results
2.  **Robustness**: Better handles various notation styles in the TTL file
3.  **Maintainability**: Cleaner code organization with separation of concerns
4.  **Extensibility**: Easier to add new features or support for additional SKOS properties
5.  **Performance**: More efficient graph traversal for large thesauri

## 8\. Potential Challenges

1.  **Library Size**: rdflib.js is a substantial library, which may increase load time
2.  **Browser Compatibility**: Ensure compatibility with older browsers
3.  **Memory Usage**: Large thesauri may require optimized memory management
4.  **Error Handling**: Robust error handling for malformed TTL files

## 9\. Fallback Strategy

If issues arise with rdflib.js, alternative approaches include:

1.  Using a lighter RDF parser like N3.js
2.  Creating a simplified custom parser for the specific UNESCO TTL format
3.  Server-side pre-processing of the TTL file into a simpler JSON structure

## 10\. Testing Strategy

1.  **Unit Tests**: Test individual parsing functions
2.  **Integration Tests**: Verify correct hierarchy extraction
3.  **UI Tests**: Ensure proper rendering and interaction
4.  **Performance Tests**: Measure parsing and rendering speed with large datasets

## 11\. Documentation

The implementation should include:

1.  Code documentation with JSDoc comments
2.  Usage examples
3.  Troubleshooting guide
4.  Explanation of SKOS concepts and relationships

## 12\. Conclusion

By implementing this proposal, the UNESCO Thesaurus Explorer will correctly parse and display the complete hierarchical structure of the thesaurus, providing users with an accurate and intuitive way to explore the knowledge organization system.