/**
 * SKOS Parser for UNESCO Thesaurus
 * Uses rdflib.js to correctly parse SKOS structures from TTL files
 */
class SKOSParser {
    constructor() {
        // Check if rdflib is available
        if (typeof $rdf === 'undefined') {
            console.error("rdflib.js library is not loaded. Make sure it is included before this script.");
            throw new Error("rdflib.js library is not loaded. Make sure it is included before this script.");
        }
        
        // Initialize namespaces
        try {
            this.RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
            this.SKOS = $rdf.Namespace("http://www.w3.org/2004/02/skos/core#");
            this.SKOSTHES = $rdf.Namespace("http://purl.org/iso25964/skos-thes#");
            this.UNESCO = $rdf.Namespace("http://vocabularies.unesco.org/");
        
        // Initialize the RDF store
        this.store = $rdf.graph();
        
        // Data structures to store parsed results
        this.conceptScheme = null;
        this.domains = [];
        this.microthesauri = [];
        this.concepts = new Map();
        this.prefixes = {};
        } catch (error) {
            console.error("Error initializing SKOSParser:", error);
            throw new Error("Failed to initialize SKOSParser: " + error.message);
        }
    }

    /**
     * Parses a TTL file content into the RDF store
     * @param {string} ttlContent - The content of the TTL file
     * @returns {Promise} - A promise that resolves when parsing is complete
     */
    parseContent(ttlContent) {
        return new Promise((resolve, reject) => {
            try {
                // Extract prefixes for reference (using regex for simple prefix extraction)
                this.extractPrefixes(ttlContent);

                // Parse the TTL content
                const baseURI = "http://vocabularies.unesco.org/thesaurus";

                $rdf.parse(ttlContent, this.store, baseURI, 'text/turtle', (error) => {
                    if (error) {
                        console.error("Error parsing TTL:", error);
                        reject(error);
                    } else {
                        // Process the parsed content
                        this.processGraph();
                        resolve(this);
                    }
                });
            } catch (error) {
                console.error("Error in parseContent:", error);
                reject(error);
            }
        });
    }

    /**
     * Extract prefixes from the TTL file using regex
     * @param {string} content - The content of the TTL file
     */
    extractPrefixes(content) {
        const prefixRegex = /@prefix\s+([a-zA-Z0-9_-]+:)\s+<([^>]+)>\s*\./g;
        let prefixMatch;
        
        while ((prefixMatch = prefixRegex.exec(content)) !== null) {
            const prefix = prefixMatch[1];
            const uri = prefixMatch[2];
            this.prefixes[prefix] = uri;
            console.log(`Found prefix: ${prefix} -> ${uri}`);
        }
    }

    /**
     * Process the RDF graph to extract the concept scheme, domains, microthesauri, and concepts
     */
    processGraph() {
        // Step 1: Find the concept scheme
        this.findConceptScheme();
        
        // Step 2: Extract all concepts from the graph
        this.extractConcepts();
        
        // Step 3: Find the top concepts (domains)
        this.findTopConcepts();
        
        // Step 4: Organize microthesauri
        this.identifyMicrothesauri();
        
        // Step 5: Extract relationships between concepts
        this.extractRelationships();
        
        console.log(`Processing complete. Found ${this.domains.length} domains, ${this.microthesauri.length} microthesauri, and ${this.concepts.size} concepts`);
    }

    /**
     * Find the concept scheme (the thesaurus itself)
     */
    findConceptScheme() {
        const schemes = this.store.each(null, this.RDF('type'), this.SKOS('ConceptScheme'));
        
        if (schemes.length > 0) {
            this.conceptScheme = schemes[0].value;
            console.log(`Found concept scheme: ${this.conceptScheme}`);
            return;
        }
        
        // Fallback: Look for nodes that have top concepts
        const schemesWithTopConcepts = this.store.each(null, this.SKOS('hasTopConcept'), null);
        if (schemesWithTopConcepts.length > 0) {
            this.conceptScheme = schemesWithTopConcepts[0].value;
            console.log(`Found concept scheme with top concepts: ${this.conceptScheme}`);
            return;
        }
        
        // If still not found, use a default URI
        this.conceptScheme = "http://vocabularies.unesco.org/thesaurus";
        console.log(`Using default concept scheme: ${this.conceptScheme}`);
    }

    /**
     * Extract all concepts from the graph
     */
    extractConcepts() {
        // Find all SKOS concepts
        const conceptNodes = this.store.each(null, this.RDF('type'), this.SKOS('Concept'));
        
        conceptNodes.forEach(conceptNode => {
            const uri = conceptNode.value;
            
            // Initialize a concept object
            const concept = {
                uri: uri,
                type: 'concept',
                labels: {},
                broader: [],
                narrower: [],
                related: [],
                inScheme: []
            };
            
            // Extract labels
            this.extractLabels(conceptNode, concept);
            
            // Store the concept
            this.concepts.set(uri, concept);
        });
        
        console.log(`Extracted ${this.concepts.size} concepts`);
    }

    /**
     * Extract labels for a concept
     * @param {Object} node - The RDF node
     * @param {Object} concept - The concept object to update
     */
    extractLabels(node, concept) {
        // Extract preferred labels
        const prefLabels = this.store.each(node, this.SKOS('prefLabel'), null);
        prefLabels.forEach(label => {
            const lang = label.language || 'en';
            concept.labels[lang] = label.value;
        });
        
        // Extract alternative labels
        const altLabels = this.store.each(node, this.SKOS('altLabel'), null);
        altLabels.forEach(label => {
            const lang = label.language || 'en';
            // Only add if there's no preferred label for this language yet
            if (!concept.labels[lang]) {
                concept.labels[lang] = label.value;
            }
        });
    }

    /**
     * Find the top concepts (domains)
     */
    findTopConcepts() {
        // Method 1: Find nodes that are explicitly marked as top concepts
        if (this.conceptScheme) {
            const schemeNode = $rdf.sym(this.conceptScheme);
            const topConcepts = this.store.each(schemeNode, this.SKOS('hasTopConcept'), null);
            
            topConcepts.forEach(topConcept => {
                const uri = topConcept.value;
                if (this.concepts.has(uri)) {
                    this.concepts.get(uri).type = 'domain';
                    this.domains.push(uri);
                }
            });
        }
        
        // Method 2: Find nodes that indicate they are top concepts
        const topConceptOfRelations = this.store.each(null, this.SKOS('topConceptOf'), null);
        topConceptOfRelations.forEach(subject => {
            const uri = subject.value;
            if (this.concepts.has(uri)) {
                this.concepts.get(uri).type = 'domain';
                if (!this.domains.includes(uri)) {
                    this.domains.push(uri);
                }
            }
        });
        
        // Method 3: Look for UNESCO-specific domain patterns
        // Search for nodes matching UNESCO domain pattern
        const allSubjects = this.store.each(null, null, null);
        allSubjects.forEach(subject => {
            const uri = subject.value;
            
            // Check for UNESCO domain pattern
            if (uri.includes('/domain') || uri.includes(':domain')) {
                let domainId;
                
                if (uri.includes('/domain')) {
                    domainId = uri.split('/domain')[1];
                } else {
                    domainId = uri.split(':domain')[1];
                }
                
                // If we have a number, it's likely a domain
                if (domainId && /^\d+$/.test(domainId)) {
                    // Create or update the domain concept
                    if (!this.concepts.has(uri)) {
                        this.concepts.set(uri, {
                            uri: uri,
                            type: 'domain',
                            labels: { 'en': `Domain ${domainId}` },
                            broader: [],
                            narrower: [],
                            related: [],
                            inScheme: this.conceptScheme ? [this.conceptScheme] : []
                        });
                    } else {
                        this.concepts.get(uri).type = 'domain';
                    }
                    
                    if (!this.domains.includes(uri)) {
                        this.domains.push(uri);
                    }
                }
            }
        });
        
        // Method 4: If still no domains, look for concepts with no broader terms
        if (this.domains.length === 0) {
            this.concepts.forEach((concept, uri) => {
                // Check if the concept has no broader concepts but has narrower ones
                if (concept.broader.length === 0 && this.store.each($rdf.sym(uri), this.SKOS('narrower'), null).length > 0) {
                    concept.type = 'domain';
                    this.domains.push(uri);
                }
            });
        }
        
        console.log(`Found ${this.domains.length} domains`);
    }

    /**
     * Identify microthesauri based on hierarchical position and naming patterns
     */
    identifyMicrothesauri() {
        // Method 1: Look for UNESCO-specific microthesaurus patterns
        const allSubjects = this.store.each(null, null, null);
        allSubjects.forEach(subject => {
            const uri = subject.value;
            
            // Check for UNESCO microthesaurus pattern
            if (uri.includes('/mt') || uri.includes(':mt')) {
                let mtId;
                
                if (uri.includes('/mt')) {
                    mtId = uri.split('/mt')[1];
                } else {
                    mtId = uri.split(':mt')[1];
                }
                
                // If we have a number with a decimal, it's likely a microthesaurus
                if (mtId && /^\d+\.\d+$/.test(mtId)) {
                    // Create or update the microthesaurus concept
                    if (!this.concepts.has(uri)) {
                        this.concepts.set(uri, {
                            uri: uri,
                            type: 'microThesaurus',
                            labels: { 'en': `Microthesaurus ${mtId}` },
                            broader: [],
                            narrower: [],
                            related: [],
                            inScheme: this.conceptScheme ? [this.conceptScheme] : []
                        });
                    } else {
                        this.concepts.get(uri).type = 'microThesaurus';
                    }
                    
                    // Add to microthesauri list
                    if (!this.microthesauri.includes(uri)) {
                        this.microthesauri.push(uri);
                    }
                    
                    // Try to associate with its domain
                    const domainNum = mtId.split('.')[0];
                    for (const domainUri of this.domains) {
                        if (domainUri.includes(`domain${domainNum}`)) {
                            // Add relationship
                            const mtConcept = this.concepts.get(uri);
                            if (!mtConcept.broader.includes(domainUri)) {
                                mtConcept.broader.push(domainUri);
                            }
                            
                            const domainConcept = this.concepts.get(domainUri);
                            if (domainConcept && !domainConcept.narrower.includes(uri)) {
                                domainConcept.narrower.push(uri);
                            }
                            
                            break;
                        }
                    }
                }
            }
        });
        
        // Method 2: Look for SKOS collections or explicit microthesaurus type
        const mtCollections = this.store.each(null, this.RDF('type'), this.SKOSTHES('MicroThesaurus'));
        mtCollections.forEach(mtNode => {
            const uri = mtNode.value;
            
            if (!this.concepts.has(uri)) {
                this.concepts.set(uri, {
                    uri: uri,
                    type: 'microThesaurus',
                    labels: {},
                    broader: [],
                    narrower: [],
                    related: [],
                    inScheme: this.conceptScheme ? [this.conceptScheme] : []
                });
                
                // Extract labels
                this.extractLabels(mtNode, this.concepts.get(uri));
            } else {
                this.concepts.get(uri).type = 'microThesaurus';
            }
            
            if (!this.microthesauri.includes(uri)) {
                this.microthesauri.push(uri);
            }
        });
        
        // Method 3: If no microthesauri identified yet, look for concepts directly under domains with their own children
        if (this.microthesauri.length === 0) {
            this.domains.forEach(domainUri => {
                const domainNode = $rdf.sym(domainUri);
                const childNodes = this.store.each(domainNode, this.SKOS('narrower'), null);
                
                childNodes.forEach(childNode => {
                    const childUri = childNode.value;
                    
                    // If this child has its own children, it might be a microthesaurus
                    const grandchildNodes = this.store.each(childNode, this.SKOS('narrower'), null);
                    if (grandchildNodes.length > 0) {
                        // Update or create the concept
                        if (!this.concepts.has(childUri)) {
                            this.concepts.set(childUri, {
                                uri: childUri,
                                type: 'microThesaurus',
                                labels: {},
                                broader: [domainUri],
                                narrower: [],
                                related: [],
                                inScheme: this.conceptScheme ? [this.conceptScheme] : []
                            });
                            
                            // Extract labels
                            this.extractLabels(childNode, this.concepts.get(childUri));
                        } else {
                            const childConcept = this.concepts.get(childUri);
                            childConcept.type = 'microThesaurus';
                            if (!childConcept.broader.includes(domainUri)) {
                                childConcept.broader.push(domainUri);
                            }
                        }
                        
                        if (!this.microthesauri.includes(childUri)) {
                            this.microthesauri.push(childUri);
                        }
                    }
                });
            });
        }
        
        console.log(`Identified ${this.microthesauri.length} microthesauri`);
    }

    /**
     * Extract hierarchical and associative relationships between concepts
     */
    extractRelationships() {
        // Process all concepts to find their relationships
        this.concepts.forEach((concept, uri) => {
            const node = $rdf.sym(uri);
            
            // Find broader concepts
            const broaderNodes = this.store.each(node, this.SKOS('broader'), null);
            broaderNodes.forEach(broaderNode => {
                const broaderUri = broaderNode.value;
                
                if (!concept.broader.includes(broaderUri)) {
                    concept.broader.push(broaderUri);
                }
                
                // Add the inverse narrower relationship
                if (this.concepts.has(broaderUri)) {
                    const broaderConcept = this.concepts.get(broaderUri);
                    if (!broaderConcept.narrower.includes(uri)) {
                        broaderConcept.narrower.push(uri);
                    }
                }
            });
            
            // Find narrower concepts
            const narrowerNodes = this.store.each(node, this.SKOS('narrower'), null);
            narrowerNodes.forEach(narrowerNode => {
                const narrowerUri = narrowerNode.value;
                
                if (!concept.narrower.includes(narrowerUri)) {
                    concept.narrower.push(narrowerUri);
                }
                
                // Add the inverse broader relationship
                if (this.concepts.has(narrowerUri)) {
                    const narrowerConcept = this.concepts.get(narrowerUri);
                    if (!narrowerConcept.broader.includes(uri)) {
                        narrowerConcept.broader.push(uri);
                    }
                }
            });
            
            // Find related concepts
            const relatedNodes = this.store.each(node, this.SKOS('related'), null);
            relatedNodes.forEach(relatedNode => {
                const relatedUri = relatedNode.value;
                
                if (!concept.related.includes(relatedUri)) {
                    concept.related.push(relatedUri);
                }
            });
            
            // Find inScheme relationships
            const schemeNodes = this.store.each(node, this.SKOS('inScheme'), null);
            schemeNodes.forEach(schemeNode => {
                const schemeUri = schemeNode.value;
                
                if (!concept.inScheme.includes(schemeUri)) {
                    concept.inScheme.push(schemeUri);
                }
            });
        });
        
        console.log("Relationship extraction complete");
    }

    /**
     * Get a hierarchical tree structure starting from domains
     * @returns {Array} - Array of domain objects with nested children
     */
    getHierarchicalTree() {
        const tree = [];
        
        // Sort domains
        const sortedDomains = [...this.domains].sort((a, b) => {
            // Extract domain numbers if possible
            const getNumber = (uri) => {
                const match = uri.match(/domain(\d+)/);
                return match ? parseInt(match[1]) : 0;
            };
            
            const numA = getNumber(a);
            const numB = getNumber(b);
            
            if (numA !== numB) {
                return numA - numB;
            }
            
            // Fall back to label comparison
            const labelA = this.concepts.get(a)?.labels?.en || a;
            const labelB = this.concepts.get(b)?.labels?.en || b;
            return labelA.localeCompare(labelB);
        });
        
        // Build tree starting from domains
        sortedDomains.forEach(domainUri => {
            const domain = this.buildSubtree(domainUri);
            if (domain) {
                tree.push(domain);
            }
        });
        
        return tree;
    }

    /**
     * Recursively build a subtree for a concept
     * @param {string} uri - The URI of the concept
     * @returns {Object|null} - The concept with its children
     */
    buildSubtree(uri) {
        if (!this.concepts.has(uri)) return null;
        
        const concept = this.concepts.get(uri);
        const result = {
            uri: uri,
            type: concept.type,
            label: concept.labels.en || concept.uri,
            children: []
        };
        
        // Sort narrower concepts: microthesauri first, then other concepts
        const sortedNarrower = [...concept.narrower].sort((a, b) => {
            const conceptA = this.concepts.get(a);
            const conceptB = this.concepts.get(b);
            
            if (!conceptA || !conceptB) return 0;
            
            // Sort by type first
            if (conceptA.type !== conceptB.type) {
                if (conceptA.type === 'microThesaurus') return -1;
                if (conceptB.type === 'microThesaurus') return 1;
            }
            
            // If same type, sort by label
            const labelA = conceptA.labels.en || conceptA.uri;
            const labelB = conceptB.labels.en || conceptB.uri;
            return labelA.localeCompare(labelB);
        });
        
        // Build children subtrees
        sortedNarrower.forEach(childUri => {
            const child = this.buildSubtree(childUri);
            if (child) {
                result.children.push(child);
            }
        });
        
        return result;
    }

    /**
     * Get detailed information about a concept
     * @param {string} uri - The URI of the concept
     * @returns {Object|null} - Detailed concept information
     */
    getConceptDetails(uri) {
        if (!this.concepts.has(uri)) return null;
        
        const concept = this.concepts.get(uri);
        const details = {
            uri: uri,
            type: concept.type,
            labels: concept.labels,
            broader: concept.broader.map(broaderUri => ({
                uri: broaderUri,
                label: this.concepts.get(broaderUri)?.labels?.en || broaderUri,
                type: this.concepts.get(broaderUri)?.type || 'concept'
            })),
            narrower: concept.narrower.map(narrowerUri => ({
                uri: narrowerUri,
                label: this.concepts.get(narrowerUri)?.labels?.en || narrowerUri,
                type: this.concepts.get(narrowerUri)?.type || 'concept'
            })),
            related: concept.related.map(relatedUri => ({
                uri: relatedUri,
                label: this.concepts.get(relatedUri)?.labels?.en || relatedUri,
                type: this.concepts.get(relatedUri)?.type || 'concept'
            }))
        };
        
        // Add definitions and scope notes if available
        const node = $rdf.sym(uri);
        
        // Get definitions
        const definitions = this.store.each(node, this.SKOS('definition'), null);
        if (definitions.length > 0) {
            details.definitions = {};
            definitions.forEach(def => {
                const lang = def.language || 'en';
                details.definitions[lang] = def.value;
            });
        }
        
        // Get scope notes
        const scopeNotes = this.store.each(node, this.SKOS('scopeNote'), null);
        if (scopeNotes.length > 0) {
            details.scopeNotes = {};
            scopeNotes.forEach(note => {
                const lang = note.language || 'en';
                details.scopeNotes[lang] = note.value;
            });
        }
        
        return details;
    }
}