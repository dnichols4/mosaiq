# UNESCO Thesaurus Explorer Improvements

## Problem Analysis

The current UNESCO Thesaurus Explorer has a critical issue with correctly parsing the SKOS-based thesaurus structure. Upon loading the thesaurus-explorer.html page, it currently displays:

```
Processing complete. Found 1 domains, 0 microthesauri, and 1 total concepts
```

This is clearly incorrect based on the UNESCO Thesaurus TTL file, which contains a rich hierarchical structure with multiple domains, microthesauri, and concepts.

## Root Causes

After analyzing the code in `thesaurus-explorer.js`, I've identified several issues:

1. **Insufficient TTL Parsing**: The current parser doesn't properly handle the SKOS schema structures used in the UNESCO thesaurus. It lacks proper recognition of the concept scheme, top concepts (domains), and the hierarchical relationships.

2. **Limited Pattern Matching**: The regular expressions used to extract concepts and relationships are too limited and don't account for various RDF notation styles present in the TTL file.

3. **Hierarchical Structure Recognition**: The code fails to properly identify and organize the three-tier hierarchy (domains → microthesauri → concepts) that is essential to the UNESCO thesaurus.

4. **URI Handling**: The code doesn't properly handle the URI patterns specific to UNESCO's thesaurus (like `:domain1`, `:mt1.05`, etc.)

## Proposed Changes

I'm implementing a complete overhaul of the `thesaurus-explorer.js` script with the following improvements:

1. **Enhanced Concept Scheme Detection**: Better identification of the main thesaurus concept scheme as the root of the hierarchy.

2. **Comprehensive Pattern Matching**: More robust regular expressions that can handle various RDF notation patterns (full URIs, prefixed notation, etc.).

3. **Proper Domain Identification**: Better logic for identifying top-level domains through both `skos:topConceptOf` relationships and UNESCO's specific domain notation.

4. **Explicit Microthesauri Recognition**: Dedicated functions to identify and organize microthesauri, including pattern matching for UNESCO's specific microthesaurus notation (`:mt1.05`).

5. **Complete Relationship Extraction**: More thorough extraction of hierarchical relationships (broader/narrower) and associative relationships (related).

6. **Hierarchical Organization**: Proper organization of the three-tier hierarchy with domains at the top, microthesauri in the middle, and concepts at the bottom.

## Implementation Approach

The new implementation will:

1. Extract prefixes from the TTL file for reference
2. Identify the main concept scheme (the thesaurus itself)
3. Extract all concepts, domains, and microthesauri
4. Extract hierarchical and associative relationships
5. Identify top concepts as domains
6. Organize microthesauri under their respective domains
7. Build and render the complete hierarchical tree

This approach is based on the more robust `enhanced-explorer.js` which already demonstrates better handling of the SKOS structure but adapted specifically for the UNESCO thesaurus format.

## Expected Outcome

After implementing these changes, the thesaurus explorer should correctly display:
- Multiple domains (top-level categories)
- Multiple microthesauri (sub-categories within domains)
- Hierarchical relationships between concepts
- A richer and more accurate representation of the UNESCO thesaurus structure

The status message should reflect accurate counts of domains, microthesauri, and concepts, and users will be able to navigate the complete hierarchical structure of the thesaurus.
