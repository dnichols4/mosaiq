// Enhanced TTL file parser for UNESCO Thesaurus
$(document).ready(function() {
    const treeElement = $('#tree');
    const detailsElement = $('#conceptDetails');
    const status = $('#status');
    const filterSelect = $('#classFilter');
    const searchInput = $('#searchInput');
    
    // Data structures
    let domains = [];
    let conceptGroups = [];
    let concepts = new Map();
    let prefixes = {};
    let typeMap = new Map(); // Maps URIs to their types (Domain, ConceptGroup, Concept)
    
    // Initialize filter options
    initializeFilters();
    
    status.text('Loading file...');
    
    // Load the TTL file
    $.ajax({
        url: './unesco-thesaurus.ttl',
        dataType: 'text',
        success: function(data) {
            status.text('File loaded, starting analysis...');
            console.log(`File loaded, size: ${data.length} bytes`);
            
            // Log a small sample of the file to the console for debugging
            console.log('File sample:', data.substring(0, 5000));
            
            parseFile(data);
        },
        error: function(xhr, status, error) {
            treeElement.html(`<div class="error">Error loading file: ${error}</div>`);
            console.error('Error loading file:', error);
        }
    });
    
    function initializeFilters() {
        // Add filter options
        filterSelect.empty();
        filterSelect.append($('<option>').val('all').text('All Classes'));
        filterSelect.append($('<option>').val('domain').text('Domains'));
        filterSelect.append($('<option>').val('conceptGroup').text('Concept Groups'));
        filterSelect.append($('<option>').val('concept').text('Concepts'));
        
        // Filter change handler
        filterSelect.on('change', function() {
            applyFilters();
        });
        
        // Search input handler
        searchInput.on('input', function() {
            applyFilters();
        });
        
        // Reset button handler
        $('#resetFilters').on('click', function() {
            filterSelect.val('all');
            searchInput.val('');
            applyFilters();
        });
    }
    
    function parseFile(content) {
        status.text('Parsing TTL prefixes...');
        
        // Extract prefixes for reference
        extractPrefixes(content);
        
        // Extract all type definitions
        status.text('Extracting entity types...');
        extractTypes(content);
        
        // Extract labels for all entities
        status.text('Extracting labels...');
        extractLabels(content);
        
        // Extract hierarchical relationships
        status.text('Building hierarchy...');
        extractRelationships(content);
        
        // Extract additional properties
        status.text('Extracting additional properties...');
        extractAdditionalProperties(content);
        
        // Build the top-level hierarchy
        organizeHierarchy();
        
        // Process UNESCO-specific structure for domains and microthesauri
        processUnescoStructure(content);
        
        status.text(`Processing complete. Found ${domains.length} domains, ${conceptGroups.length} concept groups, and ${concepts.size} total concepts`);
        
        // Render the tree
        renderTree();
    }
    
    function processUnescoStructure(content) {
        // UNESCO Thesaurus typically has a specific structure with domains and microthesauri
        // Look for domain declarations in UNESCO format
        const domainDeclaration = /domain(\d+)\s*:\s*([^\s;.]+)/g;
        let match;
        
        while ((match = domainDeclaration.exec(content)) !== null) {
            const domainNum = match[1];
            const domainName = match[2].replace(/["'<>]/g, ''); // Remove quotes or brackets
            
            const uri = `:domain${domainNum}`;
            
            // Create or update the domain
            if (!concepts.has(uri)) {
                concepts.set(uri, {
                    uri: uri,
                    type: 'domain',
                    labels: {
                        'en': domainName
                    },
                    broader: [],
                    narrower: [],
                    properties: {}
                });
                
                // Add to domains if not already there
                if (!domains.includes(uri)) {
                    domains.push(uri);
                }
            } else {
                // Update existing concept
                concepts.get(uri).type = 'domain';
                concepts.get(uri).labels['en'] = domainName;
                
                // Add to domains if not already there
                if (!domains.includes(uri)) {
                    domains.push(uri);
                }
            }
        }
        
        // Look for microthesaurus declarations
        const mtDeclaration = /mt(\d+\.\d+)\s*:\s*([^\s;.]+)/g;
        
        while ((match = mtDeclaration.exec(content)) !== null) {
            const mtNum = match[1];
            const mtName = match[2].replace(/["'<>]/g, ''); // Remove quotes or brackets
            
            const uri = `:mt${mtNum}`;
            
            // Create or update the microthesaurus
            if (!concepts.has(uri)) {
                concepts.set(uri, {
                    uri: uri,
                    type: 'conceptGroup',
                    labels: {
                        'en': mtName
                    },
                    broader: [],
                    narrower: [],
                    properties: {}
                });
                
                // Add to concept groups if not already there
                if (!conceptGroups.includes(uri)) {
                    conceptGroups.push(uri);
                }
            } else {
                // Update existing concept
                concepts.get(uri).type = 'conceptGroup';
                concepts.get(uri).labels['en'] = mtName;
                
                // Add to concept groups if not already there
                if (!conceptGroups.includes(uri)) {
                    conceptGroups.push(uri);
                }
            }
            
            // Associate with its domain based on the MT number (first digit)
            const domainNum = mtNum.split('.')[0];
            const domainUri = `:domain${domainNum}`;
            
            // Add the relationship if the domain exists
            if (concepts.has(domainUri)) {
                // Add broader/narrower relationship
                if (!concepts.get(uri).broader.includes(domainUri)) {
                    concepts.get(uri).broader.push(domainUri);
                }
                
                if (!concepts.get(domainUri).narrower.includes(uri)) {
                    concepts.get(domainUri).narrower.push(uri);
                }
            }
        }
        
        // Look for concept declarations and their association with microthesauri
        const conceptDeclaration = /:concept(\d+)\s+[^\s]+\s+mt(\d+\.\d+):/g;
        
        while ((match = conceptDeclaration.exec(content)) !== null) {
            const conceptNum = match[1];
            const mtNum = match[2];
            
            const conceptUri = `:concept${conceptNum}`;
            const mtUri = `:mt${mtNum}`;
            
            // Make sure both concept and microthesaurus exist
            if (!concepts.has(conceptUri)) {
                continue;
            }
            
            if (!concepts.has(mtUri)) {
                continue;
            }
            
            // Add the relationship
            if (!concepts.get(conceptUri).broader.includes(mtUri)) {
                concepts.get(conceptUri).broader.push(mtUri);
            }
            
            if (!concepts.get(mtUri).narrower.includes(conceptUri)) {
                concepts.get(mtUri).narrower.push(conceptUri);
            }
        }
        
        // Sort domains and concept groups
        domains.sort((a, b) => {
            // Extract domain numbers for proper numeric sorting
            const numA = a.replace(':domain', '');
            const numB = b.replace(':domain', '');
            return parseInt(numA) - parseInt(numB);
        });
        
        conceptGroups.sort((a, b) => {
            // For microthesauri, sort by their numbers (1.05 comes before 1.10)
            if (a.startsWith(':mt') && b.startsWith(':mt')) {
                const mtA = a.replace(':mt', '');
                const mtB = b.replace(':mt', '');
                return parseFloat(mtA) - parseFloat(mtB);
            }
            
            // Otherwise sort alphabetically
            const labelA = concepts.get(a)?.labels?.en || a;
            const labelB = concepts.get(b)?.labels?.en || b;
            return labelA.localeCompare(labelB);
        });
    }
    
    function extractPrefixes(content) {
        const prefixRegex = /@prefix\s+([a-zA-Z0-9_-]+:)\s+<([^>]+)>\s*\./g;
        let match;
        
        while ((match = prefixRegex.exec(content)) !== null) {
            const prefix = match[1];
            const uri = match[2];
            prefixes[prefix] = uri;
        }
        
        console.log('Extracted prefixes:', prefixes);
    }
    
    function extractTypes(content) {
        // Common RDF type patterns
        const typePatterns = [
            // Full URI patterns
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/1999\/02\/22-rdf-syntax-ns#type>\s+<([^>]+)>/g,
            // Shortened 'a' syntax
            /<([^>]+)>\s+a\s+<([^>]+)>/g,
            // Prefix 'a' syntax
            /([^\s]+)\s+a\s+([^\s]+)/g,
            // Prefix rdf:type syntax
            /([^\s]+)\s+rdf:type\s+([^\s]+)/g
        ];
        
        // UNESCO-specific: Look for microthesaurus
        const microThesaurusPattern = /<([^>]+)>\s+a\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#ConceptScheme>/g;
        let match;
        while ((match = microThesaurusPattern.exec(content)) !== null) {
            const uri = match[1];
            typeMap.set(uri, 'domain');
            
            if (!concepts.has(uri)) {
                concepts.set(uri, {
                    uri: uri,
                    type: 'domain',
                    labels: {},
                    broader: [],
                    narrower: [],
                    properties: {}
                });
            } else {
                concepts.get(uri).type = 'domain';
            }
        }
        
        // Process all type patterns
        typePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const typeUri = match[2];
                
                // Determine the entity type (Domain, ConceptGroup, Concept)
                let entityType = 'unknown';
                
                if (typeUri.includes('Domain') || typeUri === 'skos-thes:Domain' ||
                    typeUri.includes('ConceptScheme') || typeUri === 'skos:ConceptScheme') {
                    entityType = 'domain';
                } else if (typeUri.includes('ConceptGroup') || typeUri === 'skos-thes:ConceptGroup' ||
                         typeUri.includes('Collection') || typeUri === 'skos:Collection') {
                    entityType = 'conceptGroup';
                } else if (typeUri.includes('Concept') || typeUri === 'skos:Concept') {
                    entityType = 'concept';
                } else if (typeUri.includes('MicroThesaurus') || typeUri === 'skos-thes:MicroThesaurus') {
                    entityType = 'microThesaurus';
                }
                
                if (entityType !== 'unknown') {
                    typeMap.set(uri, entityType);
                    
                    // Initialize the concept in our map if it doesn't exist
                    if (!concepts.has(uri)) {
                        concepts.set(uri, {
                            uri: uri,
                            type: entityType,
                            labels: {},
                            broader: [],
                            narrower: [],
                            properties: {}
                        });
                    } else {
                        // Update the type if the concept already exists
                        concepts.get(uri).type = entityType;
                    }
                }
            }
        });
        
        console.log(`Extracted types for ${typeMap.size} entities`);
    }
    
    function extractLabels(content) {
        // Common label patterns
        const labelPatterns = [
            // Full URI pattern
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#prefLabel>\s+"([^"]+)"(?:@([a-z]+))?/g,
            // Prefix pattern
            /([^\s]+)\s+skos:prefLabel\s+"([^"]+)"(?:@([a-z]+))?/g,
            // Alternative label patterns
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#altLabel>\s+"([^"]+)"(?:@([a-z]+))?/g,
            /([^\s]+)\s+skos:altLabel\s+"([^"]+)"(?:@([a-z]+))?/g,
            // RDFS label fallback
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2000\/01\/rdf-schema#label>\s+"([^"]+)"(?:@([a-z]+))?/g,
            /([^\s]+)\s+rdfs:label\s+"([^"]+)"(?:@([a-z]+))?/g
        ];
        
        // UNESCO-specific content
        const unescoPatterns = [
            // Match domain labels
            /domain(\d+):\s+([^\s]+)/g,
            // Match microthesaurus labels
            /mt(\d+\.\d+):\s+([^\s]+)/g
        ];
        
        // Process all label patterns
        labelPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const label = match[2];
                const lang = match[3] || 'en';
                
                // Create or update the concept
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: typeMap.get(uri) || 'unknown',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {}
                    });
                }
                
                // Only add if no label exists for that language yet (prefer prefLabels over altLabels)
                if (!concepts.get(uri).labels[lang]) {
                    concepts.get(uri).labels[lang] = label;
                }
            }
        });
        
        // Process UNESCO-specific patterns
        unescoPatterns.forEach((pattern, index) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const id = match[1];
                const name = match[2];
                
                const uri = index === 0 ? `:domain${id}` : `:mt${id}`;
                const type = index === 0 ? 'domain' : 'conceptGroup';
                
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: type,
                        labels: { 'en': name },
                        broader: [],
                        narrower: [],
                        properties: {}
                    });
                } else {
                    // Update if exists
                    concepts.get(uri).type = type;
                    concepts.get(uri).labels['en'] = name;
                }
            }
        });
        
        // Handle cleaner display names for concept URIs
        concepts.forEach((concept, uri) => {
            // For domains like :domain1, :domain2
            if (uri.startsWith(':domain')) {
                // If no label, try to find a proper name
                if (!concept.labels.en) {
                    // Extract the domain number
                    const domainNum = uri.substring(7);
                    // Try to find a better name from the content
                    const match = new RegExp(`domain${domainNum}:\s+([^\s]+)`, 'i').exec(content);
                    if (match) {
                        concept.labels.en = match[1];
                    } else {
                        // Fallback to formatting the URI
                        concept.labels.en = `Domain ${domainNum}`;
                    }
                }
            }
            // For microthesauri like :mt1.05, :mt1.10
            else if (uri.startsWith(':mt')) {
                // If no label, try to find a proper name
                if (!concept.labels.en) {
                    // Extract the MT number
                    const mtNum = uri.substring(3);
                    // Try to find a better name from the content
                    const match = new RegExp(`mt${mtNum}:\s+([^\s]+)`, 'i').exec(content);
                    if (match) {
                        concept.labels.en = match[1];
                    } else {
                        // Fallback to formatting the URI
                        concept.labels.en = `Microthesaurus ${mtNum}`;
                    }
                }
            }
            // For concept URIs that have no label but might be a word
            else if ((!concept.labels.en || concept.labels.en === uri) && 
                     uri.startsWith(':') && !uri.includes('/')) {
                // Remove the colon prefix and use as label
                const cleanLabel = uri.substring(1)
                    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
                    .replace(/_/g, ' ')  // Replace underscores with spaces
                    .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
                    
                concept.labels.en = cleanLabel;
            }
        });
        
        console.log(`Extracted labels for ${concepts.size} entities`);
        
        // Dump a few sample concept labels to console for debugging
        let sampleCount = 0;
        concepts.forEach((concept, uri) => {
            if (sampleCount < 10) {
                console.log(`Sample concept: ${uri} -> ${concept.labels.en || 'NO LABEL'} (${concept.type})`);
                sampleCount++;
            }
        });
    }
    
    function extractRelationships(content) {
        // Relationship patterns
        const relationPatterns = [
            // Broader relationships (full URI)
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#broader>\s+<([^>]+)>/g,
            // Broader (prefix)
            /([^\s]+)\s+skos:broader\s+([^\s]+)/g,
            // Narrower (full URI)
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#narrower>\s+<([^>]+)>/g,
            // Narrower (prefix)
            /([^\s]+)\s+skos:narrower\s+([^\s]+)/g,
            // Member/memberOf (for concept groups)
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#member>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:member\s+([^\s]+)/g,
            /<([^>]+)>\s+<http:\/\/purl\.org\/iso25964\/skos-thes#memberOf>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos-thes:memberOf\s+([^\s]+)/g,
            // In scheme relationship
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#inScheme>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:inScheme\s+([^\s]+)/g,
            // Top concept relationship
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#topConceptOf>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:topConceptOf\s+([^\s]+)/g,
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#hasTopConcept>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:hasTopConcept\s+([^\s]+)/g
        ];
        
        // First, process broader/narrower relationships
        [relationPatterns[0], relationPatterns[1]].forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const broaderUri = match[2];
                
                // Create entities if they don't exist
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: typeMap.get(uri) || 'unknown',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {}
                    });
                }
                
                if (!concepts.has(broaderUri)) {
                    concepts.set(broaderUri, {
                        uri: broaderUri,
                        type: typeMap.get(broaderUri) || 'unknown',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {}
                    });
                }
                
                // Add the relationship if it doesn't already exist
                if (!concepts.get(uri).broader.includes(broaderUri)) {
                    concepts.get(uri).broader.push(broaderUri);
                }
                
                if (!concepts.get(broaderUri).narrower.includes(uri)) {
                    concepts.get(broaderUri).narrower.push(uri);
                }
            }
        });
        
        // Process narrower relationships
        [relationPatterns[2], relationPatterns[3]].forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const narrowerUri = match[2];
                
                // Create entities if they don't exist
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: typeMap.get(uri) || 'unknown',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {}
                    });
                }
                
                if (!concepts.has(narrowerUri)) {
                    concepts.set(narrowerUri, {
                        uri: narrowerUri,
                        type: typeMap.get(narrowerUri) || 'unknown',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {}
                    });
                }
                
                // Add the relationship if it doesn't already exist
                if (!concepts.get(uri).narrower.includes(narrowerUri)) {
                    concepts.get(uri).narrower.push(narrowerUri);
                }
                
                if (!concepts.get(narrowerUri).broader.includes(uri)) {
                    concepts.get(narrowerUri).broader.push(uri);
                }
            }
        });
        
        // Process member relationships (for concept groups)
        [relationPatterns[4], relationPatterns[5]].forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const groupUri = match[1];
                const memberUri = match[2];
                
                // Create entities if they don't exist
                if (!concepts.has(groupUri)) {
                    concepts.set(groupUri, {
                        uri: groupUri,
                        type: typeMap.get(groupUri) || 'conceptGroup',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {},
                        members: []
                    });
                } else if (!concepts.get(groupUri).members) {
                    concepts.get(groupUri).members = [];
                }
                
                if (!concepts.has(memberUri)) {
                    concepts.set(memberUri, {
                        uri: memberUri,
                        type: typeMap.get(memberUri) || 'concept',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {},
                        memberOf: []
                    });
                } else if (!concepts.get(memberUri).memberOf) {
                    concepts.get(memberUri).memberOf = [];
                }
                
                // Add the relationship
                if (!concepts.get(groupUri).members.includes(memberUri)) {
                    concepts.get(groupUri).members.push(memberUri);
                }
                
                if (!concepts.get(memberUri).memberOf.includes(groupUri)) {
                    concepts.get(memberUri).memberOf.push(groupUri);
                }
            }
        });
        
        // Process memberOf relationships
        [relationPatterns[6], relationPatterns[7]].forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const memberUri = match[1];
                const groupUri = match[2];
                
                // Create entities if they don't exist
                if (!concepts.has(groupUri)) {
                    concepts.set(groupUri, {
                        uri: groupUri,
                        type: typeMap.get(groupUri) || 'conceptGroup',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {},
                        members: []
                    });
                } else if (!concepts.get(groupUri).members) {
                    concepts.get(groupUri).members = [];
                }
                
                if (!concepts.has(memberUri)) {
                    concepts.set(memberUri, {
                        uri: memberUri,
                        type: typeMap.get(memberUri) || 'concept',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {},
                        memberOf: []
                    });
                } else if (!concepts.get(memberUri).memberOf) {
                    concepts.get(memberUri).memberOf = [];
                }
                
                // Add the relationship
                if (!concepts.get(groupUri).members.includes(memberUri)) {
                    concepts.get(groupUri).members.push(memberUri);
                }
                
                if (!concepts.get(memberUri).memberOf.includes(groupUri)) {
                    concepts.get(memberUri).memberOf.push(groupUri);
                }
            }
        });
        
        console.log(`Extracted relationships for ${concepts.size} entities`);
    }
    
    function extractAdditionalProperties(content) {
        // Property patterns for descriptions, notes, etc.
        const propertyPatterns = [
            // Description/definition (full URI)
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#definition>\s+"([^"]+)"(?:@([a-z]+))?/g,
            // Description/definition (prefix)
            /([^\s]+)\s+skos:definition\s+"([^"]+)"(?:@([a-z]+))?/g,
            // Scope note (full URI)
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#scopeNote>\s+"([^"]+)"(?:@([a-z]+))?/g,
            // Scope note (prefix)
            /([^\s]+)\s+skos:scopeNote\s+"([^"]+)"(?:@([a-z]+))?/g
        ];
        
        // Process properties
        propertyPatterns.forEach((pattern, index) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const value = match[2];
                const lang = match[3] || 'en';
                
                // Determine property name based on pattern index
                let propName;
                if (index < 2) {
                    propName = 'definition';
                } else {
                    propName = 'scopeNote';
                }
                
                // Create entity if it doesn't exist
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: typeMap.get(uri) || 'unknown',
                        labels: {},
                        broader: [],
                        narrower: [],
                        properties: {}
                    });
                }
                
                // Initialize property object if needed
                if (!concepts.get(uri).properties[propName]) {
                    concepts.get(uri).properties[propName] = {};
                }
                
                // Add the property value for this language
                concepts.get(uri).properties[propName][lang] = value;
            }
        });
        
        // Check for topConcept relationships
        const topConceptPatterns = [
            // Top concept relationship (full URI)
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#topConceptOf>\s+<([^>]+)>/g,
            // Top concept relationship (prefix)
            /([^\s]+)\s+skos:topConceptOf\s+([^\s]+)/g,
            // Has top concept relationship (URI)
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#hasTopConcept>\s+<([^>]+)>/g,
            // Has top concept relationship (prefix)
            /([^\s]+)\s+skos:hasTopConcept\s+([^\s]+)/g
        ];
        
        // Process top concept patterns
        topConceptPatterns.forEach((pattern, index) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                // The first two patterns have topConcept as the subject
                if (index < 2) {
                    const conceptUri = match[1];
                    const schemeUri = match[2];
                    
                    if (!concepts.has(conceptUri)) {
                        concepts.set(conceptUri, {
                            uri: conceptUri,
                            type: 'concept',
                            labels: {},
                            broader: [],
                            narrower: [],
                            properties: {isTopConcept: true}
                        });
                    } else {
                        concepts.get(conceptUri).properties.isTopConcept = true;
                    }
                    
                    // Also mark the scheme as a domain
                    if (!concepts.has(schemeUri)) {
                        concepts.set(schemeUri, {
                            uri: schemeUri,
                            type: 'domain',
                            labels: {},
                            broader: [],
                            narrower: [],
                            properties: {}
                        });
                    } else {
                        concepts.get(schemeUri).type = 'domain';
                    }
                }
                // The second two patterns have the scheme as the subject
                else {
                    const schemeUri = match[1];
                    const conceptUri = match[2];
                    
                    if (!concepts.has(conceptUri)) {
                        concepts.set(conceptUri, {
                            uri: conceptUri,
                            type: 'concept',
                            labels: {},
                            broader: [],
                            narrower: [],
                            properties: {isTopConcept: true}
                        });
                    } else {
                        concepts.get(conceptUri).properties.isTopConcept = true;
                    }
                    
                    // Also mark the scheme as a domain
                    if (!concepts.has(schemeUri)) {
                        concepts.set(schemeUri, {
                            uri: schemeUri,
                            type: 'domain',
                            labels: {},
                            broader: [],
                            narrower: [],
                            properties: {}
                        });
                    } else {
                        concepts.get(schemeUri).type = 'domain';
                    }
                }
            }
        });
    }
    
    function organizeHierarchy() {
        // Identify top-level domains
        domains = [];
        conceptGroups = [];
        
        // First, look for entities explicitly typed as domains
        concepts.forEach((concept, uri) => {
            if (concept.type === 'domain') {
                domains.push(uri);
            } else if (concept.type === 'conceptGroup' || concept.type === 'microThesaurus') {
                conceptGroups.push(uri);
            }
        });
        
        // Look for top concept relationships
        const topConcepts = new Set();
        concepts.forEach((concept, uri) => {
            // Check if it's explicitly marked as a top concept
            if (concept.properties.isTopConcept) {
                domains.push(uri);
                return;
            }
            
            // Check if it has broader concepts but no narrower - might be a domain
            if (concept.broader.length === 0 && concept.narrower.length > 0) {
                topConcepts.add(uri);
            }
        });
        
        // If we still have no domains, use the identified top concepts
        if (domains.length === 0 && topConcepts.size > 0) {
            domains = Array.from(topConcepts);
        }
        
        // If STILL no domains, use any concept that has narrower concepts
        if (domains.length === 0) {
            concepts.forEach((concept, uri) => {
                if (concept.narrower.length > 0) {
                    domains.push(uri);
                }
            });
            
            // Limit to a reasonable number
            if (domains.length > 30) {
                domains = domains.slice(0, 30);
            }
        }
        
        // If ABSOLUTELY no hierarchy is found, just add some concepts as domains
        if (domains.length === 0) {
            let count = 0;
            concepts.forEach((concept, uri) => {
                if (concept.labels.en && count < 30) {
                    domains.push(uri);
                    count++;
                }
            });
        }
        
        // Sort domains and concept groups by label
        domains.sort((a, b) => {
            const labelA = concepts.get(a)?.labels?.en || concepts.get(a)?.labels?.fr || a;
            const labelB = concepts.get(b)?.labels?.en || concepts.get(b)?.labels?.fr || b;
            return labelA.localeCompare(labelB);
        });
        
        conceptGroups.sort((a, b) => {
            const labelA = concepts.get(a)?.labels?.en || concepts.get(a)?.labels?.fr || a;
            const labelB = concepts.get(b)?.labels?.en || concepts.get(b)?.labels?.fr || b;
            return labelA.localeCompare(labelB);
        });
        
        console.log("Top domains identified:", domains.slice(0, 5));
    }
    
    function renderTree() {
        treeElement.empty();
        
        if (domains.length === 0 && conceptGroups.length === 0) {
            treeElement.html('<div class="no-results">No domains or concept groups found in the file.</div>');
            return;
        }
        
        // Add domains first
        domains.forEach(uri => {
            renderNode(uri, treeElement);
        });
        
        // Add concept groups that aren't already displayed as part of a domain
        conceptGroups.forEach(uri => {
            const concept = concepts.get(uri);
            // Only add top-level concept groups (not part of a domain)
            if (concept && concept.broader.length === 0) {
                renderNode(uri, treeElement);
            }
        });
        
        // Apply initial filters
        applyFilters();
    }
    
    function renderNode(uri, container) {
        const concept = concepts.get(uri);
        if (!concept) return;
        
        // For URIs like :concept10 or :domain7, extract the full label from the concept object
        let label = concept.labels.en || concept.labels.fr || '';
        
        // If still no label, try to extract something meaningful from the URI
        if (!label) {
            if (uri.includes('#')) {
                // For URIs with fragment identifiers, use the fragment
                label = uri.split('#').pop();
            } else if (uri.includes('/')) {
                // For full URIs, use the last path segment
                label = uri.split('/').pop();
            } else if (uri.startsWith(':')) {
                // For prefix URIs like :concept10, clean them up
                label = uri.substring(1)
                    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
                    .replace(/([0-9]+)/g, ' $1') // Add space before numbers
                    .replace(/_/g, ' ')  // Replace underscores with spaces
                    .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
            } else {
                // Fallback
                label = uri;
            }
        }
        
        // Create node elements
        const node = $('<div>').addClass('tree-node').attr('data-uri', uri).attr('data-type', concept.type);
        const nodeContent = $('<div>').addClass('node-content');
        
        // Add expander if the node has children
        const hasChildren = concept.narrower.length > 0 || (concept.members && concept.members.length > 0);
        if (hasChildren) {
            const expander = $('<span>').addClass('expander collapsed').text('+');
            nodeContent.append(expander);
        } else {
            const spacer = $('<span>').addClass('spacer').text(' ');
            nodeContent.append(spacer);
        }
        
        // Add appropriate icon for the concept type
        const iconClass = `icon-${concept.type || 'concept'}`;
        const icon = $('<span>').addClass(`icon ${iconClass}`);
        
        // Add label
        const labelSpan = $('<span>').addClass('label').text(label);
        
        // Assemble the node
        nodeContent.append(icon, labelSpan);
        node.append(nodeContent);
        
        // Create container for children
        const childrenContainer = $('<div>').addClass('children hidden');
        node.append(childrenContainer);
        
        // Add click handler
        nodeContent.on('click', function(e) {
            if ($(e.target).hasClass('expander')) {
                toggleChildren($(this).parent(), concept);
            }
            
            // Show details
            showDetails(concept);
            
            // Highlight selected node
            $('.node-content').removeClass('selected');
            $(this).addClass('selected');
        });
        
        // Add the node to the container
        container.append(node);
    }
    
    function toggleChildren(node, concept) {
        const childrenContainer = node.find('.children').first();
        const expander = node.find('.expander').first();
        
        if (childrenContainer.hasClass('hidden')) {
            // Load children if not already loaded
            if (childrenContainer.children().length === 0) {
                loadChildren(childrenContainer, concept);
            }
            
            childrenContainer.removeClass('hidden');
            expander.text('-').removeClass('collapsed').addClass('expanded');
        } else {
            childrenContainer.addClass('hidden');
            expander.text('+').removeClass('expanded').addClass('collapsed');
        }
    }
    
    function loadChildren(container, concept) {
        // First add narrower concepts
        concept.narrower.forEach(childUri => {
            renderNode(childUri, container);
        });
        
        // Then add members (for concept groups)
        if (concept.members) {
            concept.members.forEach(memberUri => {
                if (!concept.narrower.includes(memberUri)) {
                    renderNode(memberUri, container);
                }
            });
        }
    }
    
    function showDetails(concept) {
        let html = '<div class="concept-detail">';
        
        const label = concept.labels.en || concept.labels.fr || concept.uri.split('/').pop();
        html += `<h3>${label}</h3>`;
        
        // Display type
        html += `<p><strong>Type:</strong> ${concept.type || 'Unknown'}</p>`;
        
        // Display URI
        html += `<p><strong>URI:</strong> ${concept.uri}</p>`;
        
        // Display alternative languages
        Object.entries(concept.labels).forEach(([lang, label]) => {
            if (lang !== 'en') {
                html += `<p><strong>${lang.toUpperCase()} Label:</strong> ${label}</p>`;
            }
        });
        
        // Display definitions if available
        if (concept.properties.definition) {
            html += '<div class="property-section"><h4>Definition</h4>';
            Object.entries(concept.properties.definition).forEach(([lang, text]) => {
                html += `<p><strong>${lang.toUpperCase()}:</strong> ${text}</p>`;
            });
            html += '</div>';
        }
        
        // Display scope notes if available
        if (concept.properties.scopeNote) {
            html += '<div class="property-section"><h4>Scope Note</h4>';
            Object.entries(concept.properties.scopeNote).forEach(([lang, text]) => {
                html += `<p><strong>${lang.toUpperCase()}:</strong> ${text}</p>`;
            });
            html += '</div>';
        }
        
        // Display broader concepts
        if (concept.broader.length > 0) {
            html += '<div class="related-concepts"><h4>Broader Concepts</h4><ul>';
            concept.broader.forEach(uri => {
                const broader = concepts.get(uri);
                if (broader) {
                    const label = broader.labels.en || broader.labels.fr || uri.split('/').pop();
                    html += `<li><span class="concept-link" data-uri="${uri}">${label}</span> (${broader.type})</li>`;
                }
            });
            html += '</ul></div>';
        }
        
        // Display narrower concepts
        if (concept.narrower.length > 0) {
            html += '<div class="related-concepts"><h4>Narrower Concepts</h4><ul>';
            concept.narrower.forEach(uri => {
                const narrower = concepts.get(uri);
                if (narrower) {
                    const label = narrower.labels.en || narrower.labels.fr || uri.split('/').pop();
                    html += `<li><span class="concept-link" data-uri="${uri}">${label}</span> (${narrower.type})</li>`;
                }
            });
            html += '</ul></div>';
        }
        
        // Display members (for concept groups)
        if (concept.members && concept.members.length > 0) {
            html += '<div class="related-concepts"><h4>Members</h4><ul>';
            concept.members.forEach(uri => {
                const member = concepts.get(uri);
                if (member) {
                    const label = member.labels.en || member.labels.fr || uri.split('/').pop();
                    html += `<li><span class="concept-link" data-uri="${uri}">${label}</span> (${member.type})</li>`;
                }
            });
            html += '</ul></div>';
        }
        
        // Display memberOf relationships
        if (concept.memberOf && concept.memberOf.length > 0) {
            html += '<div class="related-concepts"><h4>Member Of</h4><ul>';
            concept.memberOf.forEach(uri => {
                const group = concepts.get(uri);
                if (group) {
                    const label = group.labels.en || group.labels.fr || uri.split('/').pop();
                    html += `<li><span class="concept-link" data-uri="${uri}">${label}</span> (${group.type})</li>`;
                }
            });
            html += '</ul></div>';
        }
        
        html += '</div>';
        detailsElement.html(html);
        
        // Add click handlers for concept links
        $('.concept-link').on('click', function() {
            const uri = $(this).data('uri');
            const concept = concepts.get(uri);
            if (concept) {
                // Find the node in the tree
                const node = $(`.tree-node[data-uri="${uri}"]`);
                if (node.length > 0) {
                    // Expand parent nodes if needed
                    expandToNode(node);
                    
                    // Scroll to the node
                    treeElement.scrollTop(node.position().top - treeElement.position().top);
                    
                    // Highlight the node
                    $('.node-content').removeClass('selected');
                    node.find('.node-content').first().addClass('selected');
                }
                
                // Show details
                showDetails(concept);
            }
        });
    }
    
    function expandToNode(node) {
        // Find all parent nodes that need to be expanded
        let parent = node.parent().closest('.tree-node');
        while (parent.length > 0) {
            const children = parent.find('.children').first();
            if (children.hasClass('hidden')) {
                const expander = parent.find('.expander').first();
                expander.text('-').removeClass('collapsed').addClass('expanded');
                children.removeClass('hidden');
            }
            parent = parent.parent().closest('.tree-node');
        }
    }
    
    function applyFilters() {
        const filterType = filterSelect.val();
        const searchText = searchInput.val().toLowerCase();
        
        // Show/hide nodes based on filter
        $('.tree-node').each(function() {
            const node = $(this);
            const nodeType = node.data('type');
            const nodeLabel = node.find('.label').first().text().toLowerCase();
            
            // Type filter
            const typeMatch = filterType === 'all' || nodeType === filterType;
            
            // Text search filter
            const textMatch = searchText === '' || nodeLabel.includes(searchText);
            
            // Apply filters
            if (typeMatch && textMatch) {
                node.show();
                if (searchText !== '' && textMatch) {
                    node.find('.node-content').first().addClass('search-match');
                } else {
                    node.find('.node-content').first().removeClass('search-match');
                }
            } else {
                node.hide();
                node.find('.node-content').first().removeClass('search-match');
            }
        });
        
        // If search is active, expand all nodes to show all matches
        if (searchText !== '') {
            $('.expander.collapsed').each(function() {
                const expander = $(this);
                const node = expander.closest('.tree-node');
                const concept = concepts.get(node.data('uri'));
                if (concept) {
                    toggleChildren(node, concept);
                }
            });
        }
    }
});