// UNESCO Thesaurus Explorer - SKOS Parser
// This script handles UNESCO TTL files that follow the SKOS schema

$(document).ready(function() {
    const treeElement = $('#tree');
    const detailsElement = $('#conceptDetails');
    const status = $('#status');
    
    // Data structures
    let domains = [];
    let microthesauri = [];
    let concepts = new Map();
    let prefixes = {};
    let conceptScheme = null;
    
    status.text('Loading file...');
    
    // Load the TTL file
    $.ajax({
        url: './unesco-thesaurus.ttl',
        dataType: 'text',
        success: function(data) {
            status.text('File loaded, starting analysis...');
            console.log(`File loaded, size: ${data.length} bytes`);
            analyzeFile(data);
        },
        error: function(xhr, status, error) {
            treeElement.html(`<div class="error">Error loading file: ${error}</div>`);
            console.error('Error loading file:', error);
        }
    });
    
    function analyzeFile(content) {
        // First print the beginning to understand format
        console.log('File beginning:', content.substring(0, 500));
        
        status.text('Analyzing TTL format...');
        
        // Extract prefixes for reference
        extractPrefixes(content);
        
        // First identify the concept scheme (the thesaurus itself)
        identifyConceptScheme(content);
        
        // Extract all concepts, domains, microthesauri
        extractConcepts(content);
        
        // Extract hierarchical relationships
        extractRelationships(content);
        
        // Look for top concepts - these are the domains
        identifyTopConcepts(content);
        
        // Try to organize microthesauri under domains
        organizeMicrothesauri(content);
        
        // Render the hierarchy
        status.text(`Processing complete. Found ${domains.length} domains, ${microthesauri.length} microthesauri, and ${concepts.size} total concepts`);
        renderTree();
    }
    
    function extractPrefixes(content) {
        const prefixRegex = /@prefix\s+([a-zA-Z0-9_-]+:)\s+<([^>]+)>\s*\./g;
        let prefixMatch;
        
        while ((prefixMatch = prefixRegex.exec(content)) !== null) {
            const prefix = prefixMatch[1];
            const uri = prefixMatch[2];
            prefixes[prefix] = uri;
            console.log(`Found prefix: ${prefix} -> ${uri}`);
        }
        
        console.log('Prefixes:', prefixes);
    }
    
    function identifyConceptScheme(content) {
        // Look for the main concept scheme (the thesaurus)
        const schemePatterns = [
            /<([^>]+)>\s+a\s+skos:ConceptScheme/g,
            /<([^>]+)>\s+a\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#ConceptScheme>/g,
            /([^\s]+)\s+a\s+skos:ConceptScheme/g,
            /([^\s]+)\s+rdf:type\s+skos:ConceptScheme/g
        ];
        
        for (const pattern of schemePatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                conceptScheme = match[1];
                console.log('Found concept scheme:', conceptScheme);
                return;
            }
        }
        
        // If no concept scheme found, try to find one from top concepts
        const topConceptPattern = /skos:hasTopConcept\s+:concept/;
        if (topConceptPattern.test(content)) {
            conceptScheme = '<http://vocabularies.unesco.org/thesaurus>';
            console.log('Inferred concept scheme:', conceptScheme);
        }
    }
    
    function extractConcepts(content) {
        // Look for concept definitions
        const conceptPatterns = [
            // Full URIs
            /<([^>]+)>\s+a\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#Concept>/g,
            // Prefixed notation
            /([^\s]+)\s+a\s+skos:Concept/g,
            // RDF type notation
            /([^\s]+)\s+rdf:type\s+skos:Concept/g
        ];
        
        // Extract all concepts first
        for (const pattern of conceptPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: 'concept',
                        labels: {},
                        broader: [],
                        narrower: [],
                        related: [],
                        inScheme: []
                    });
                }
            }
        }
        
        // Extract concept labels
        const labelPatterns = [
            // Full URI
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#prefLabel>\s+"([^"]+)"(?:@([a-z]+))?/g,
            // Prefix notation
            /([^\s]+)\s+skos:prefLabel\s+"([^"]+)"(?:@([a-z]+))?/g
        ];
        
        for (const pattern of labelPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const label = match[2];
                const lang = match[3] || 'en';
                
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: 'concept',
                        labels: {},
                        broader: [],
                        narrower: [],
                        related: [],
                        inScheme: []
                    });
                }
                
                concepts.get(uri).labels[lang] = label;
            }
        }
        
        // Collect alternative labels too
        const altLabelPatterns = [
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#altLabel>\s+"([^"]+)"(?:@([a-z]+))?/g,
            /([^\s]+)\s+skos:altLabel\s+"([^"]+)"(?:@([a-z]+))?/g
        ];
        
        for (const pattern of altLabelPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const label = match[2];
                const lang = match[3] || 'en';
                
                if (concepts.has(uri) && !concepts.get(uri).labels[lang]) {
                    concepts.get(uri).labels[lang] = label;
                }
            }
        }
        
        console.log(`Extracted ${concepts.size} concepts`);
    }
    
    function extractRelationships(content) {
        // Extract broader/narrower relationships
        const relationPatterns = [
            // Broader relationships
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#broader>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:broader\s+([^\s]+)/g,
            
            // Narrower relationships
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#narrower>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:narrower\s+([^\s]+)/g,
            
            // In scheme relationships
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#inScheme>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:inScheme\s+([^\s]+)/g
        ];
        
        // Process broader relationships
        for (let i = 0; i < 2; i++) {
            const pattern = relationPatterns[i];
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const broaderUri = match[2];
                
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri, 
                        type: 'concept',
                        labels: {},
                        broader: [broaderUri],
                        narrower: [],
                        related: [],
                        inScheme: []
                    });
                } else if (!concepts.get(uri).broader.includes(broaderUri)) {
                    concepts.get(uri).broader.push(broaderUri);
                }
                
                if (!concepts.has(broaderUri)) {
                    concepts.set(broaderUri, {
                        uri: broaderUri,
                        type: 'concept',
                        labels: {},
                        broader: [],
                        narrower: [uri],
                        related: [],
                        inScheme: []
                    });
                } else if (!concepts.get(broaderUri).narrower.includes(uri)) {
                    concepts.get(broaderUri).narrower.push(uri);
                }
            }
        }
        
        // Process narrower relationships
        for (let i = 2; i < 4; i++) {
            const pattern = relationPatterns[i];
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const narrowerUri = match[2];
                
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: 'concept',
                        labels: {},
                        broader: [],
                        narrower: [narrowerUri],
                        related: [],
                        inScheme: []
                    });
                } else if (!concepts.get(uri).narrower.includes(narrowerUri)) {
                    concepts.get(uri).narrower.push(narrowerUri);
                }
                
                if (!concepts.has(narrowerUri)) {
                    concepts.set(narrowerUri, {
                        uri: narrowerUri,
                        type: 'concept',
                        labels: {},
                        broader: [uri],
                        narrower: [],
                        related: [],
                        inScheme: []
                    });
                } else if (!concepts.get(narrowerUri).broader.includes(uri)) {
                    concepts.get(narrowerUri).broader.push(uri);
                }
            }
        }
        
        // Process inScheme relationships
        for (let i = 4; i < 6; i++) {
            const pattern = relationPatterns[i];
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const schemeUri = match[2];
                
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: 'concept',
                        labels: {},
                        broader: [],
                        narrower: [],
                        related: [],
                        inScheme: [schemeUri]
                    });
                } else if (!concepts.get(uri).inScheme.includes(schemeUri)) {
                    concepts.get(uri).inScheme.push(schemeUri);
                }
            }
        }
        
        // Extract related concepts
        const relatedPatterns = [
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#related>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:related\s+([^\s]+)/g
        ];
        
        for (const pattern of relatedPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const uri = match[1];
                const relatedUri = match[2];
                
                if (!concepts.has(uri)) {
                    concepts.set(uri, {
                        uri: uri,
                        type: 'concept',
                        labels: {},
                        broader: [],
                        narrower: [],
                        related: [relatedUri],
                        inScheme: []
                    });
                } else if (!concepts.get(uri).related.includes(relatedUri)) {
                    concepts.get(uri).related.push(relatedUri);
                }
            }
        }
        
        console.log('Relationship extraction complete');
    }
    
    function identifyTopConcepts(content) {
        // Find top concepts (these are the domains)
        const topConceptPatterns = [
            // Top concept of a scheme
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#topConceptOf>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:topConceptOf\s+([^\s]+)/g,
            
            // Scheme has a top concept
            /<([^>]+)>\s+<http:\/\/www\.w3\.org\/2004\/02\/skos\/core#hasTopConcept>\s+<([^>]+)>/g,
            /([^\s]+)\s+skos:hasTopConcept\s+([^\s]+)/g
        ];
        
        // Process top concept relationships
        for (let i = 0; i < 2; i++) {
            const pattern = topConceptPatterns[i];
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const conceptUri = match[1];
                const schemeUri = match[2];
                
                if (!concepts.has(conceptUri)) {
                    continue;
                }
                
                // Mark as a top concept (domain)
                concepts.get(conceptUri).type = 'domain';
                
                // Add to domains list if not already there
                if (!domains.includes(conceptUri)) {
                    domains.push(conceptUri);
                }
            }
        }
        
        // Process has top concept relationships
        for (let i = 2; i < 4; i++) {
            const pattern = topConceptPatterns[i];
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const schemeUri = match[1];
                const conceptUri = match[2];
                
                if (!concepts.has(conceptUri)) {
                    continue;
                }
                
                // Mark as a top concept (domain)
                concepts.get(conceptUri).type = 'domain';
                
                // Add to domains list if not already there
                if (!domains.includes(conceptUri)) {
                    domains.push(conceptUri);
                }
            }
        }
        
        // If still no domains found, look for concepts with no broader terms
        if (domains.length === 0) {
            concepts.forEach((concept, uri) => {
                if (concept.broader.length === 0 && concept.narrower.length > 0) {
                    concept.type = 'domain';
                    domains.push(uri);
                }
            });
        }
        
        // Look for UNESCO's specific domain notation (top-level concepts)
        const unescoPatterns = [
            // Domain patterns in UNESCO format
            /:domain(\d+)\s/g,
            /domain(\d+):/g
        ];
        
        for (const pattern of unescoPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const domainNum = match[1];
                const domainUri = `:domain${domainNum}`;
                
                if (!concepts.has(domainUri)) {
                    // Create the domain concept
                    concepts.set(domainUri, {
                        uri: domainUri,
                        type: 'domain',
                        labels: { 'en': `Domain ${domainNum}` },
                        broader: [],
                        narrower: [],
                        related: [],
                        inScheme: conceptScheme ? [conceptScheme] : []
                    });
                } else {
                    // Just update the type
                    concepts.get(domainUri).type = 'domain';
                }
                
                // Add to domains if not already there
                if (!domains.includes(domainUri)) {
                    domains.push(domainUri);
                }
            }
        }
        
        console.log(`Identified ${domains.length} domains`);
    }
    
    function organizeMicrothesauri(content) {
        // In UNESCO Thesaurus, microthesauri typically have URIs like :mt1.05
        // First try to find microthesauri by their URI pattern
        const mtPattern = /:mt(\d+\.\d+)/g;
        let match;
        
        while ((match = mtPattern.exec(content)) !== null) {
            const mtNum = match[1];
            const mtUri = `:mt${mtNum}`;
            
            if (!concepts.has(mtUri)) {
                // Create the microthesaurus concept
                concepts.set(mtUri, {
                    uri: mtUri,
                    type: 'microThesaurus',
                    labels: { 'en': `Microthesaurus ${mtNum}` },
                    broader: [],
                    narrower: [],
                    related: [],
                    inScheme: conceptScheme ? [conceptScheme] : []
                });
            } else {
                // Just update the type
                concepts.get(mtUri).type = 'microThesaurus';
            }
            
            // Add to microthesauri list if not already there
            if (!microthesauri.includes(mtUri)) {
                microthesauri.push(mtUri);
            }
            
            // Associate with its domain based on the first number
            const domainNum = mtNum.split('.')[0];
            const domainUri = `:domain${domainNum}`;
            
            // Add relationship if domain exists
            if (concepts.has(domainUri)) {
                if (!concepts.get(mtUri).broader.includes(domainUri)) {
                    concepts.get(mtUri).broader.push(domainUri);
                }
                
                if (!concepts.get(domainUri).narrower.includes(mtUri)) {
                    concepts.get(domainUri).narrower.push(mtUri);
                }
            }
        }
        
        // Look for concepts that are direct children of domains but have their own children
        // These might be microthesauri
        if (microthesauri.length === 0) {
            domains.forEach(domainUri => {
                if (!concepts.has(domainUri)) return;
                
                concepts.get(domainUri).narrower.forEach(childUri => {
                    if (!concepts.has(childUri)) return;
                    
                    const child = concepts.get(childUri);
                    if (child.narrower.length > 0 && child.type === 'concept') {
                        child.type = 'microThesaurus';
                        microthesauri.push(childUri);
                    }
                });
            });
        }
        
        // If still no microthesauri found, look for concepts with both broader and narrower terms
        if (microthesauri.length === 0) {
            concepts.forEach((concept, uri) => {
                if (concept.broader.length > 0 && concept.narrower.length > 0 && concept.type === 'concept') {
                    // Check if any broader concept is a domain
                    const hasDomainParent = concept.broader.some(broaderUri => 
                        concepts.has(broaderUri) && concepts.get(broaderUri).type === 'domain'
                    );
                    
                    if (hasDomainParent) {
                        concept.type = 'microThesaurus';
                        microthesauri.push(uri);
                    }
                }
            });
        }
        
        console.log(`Identified ${microthesauri.length} microthesauri`);
    }
    
    function renderTree() {
        treeElement.empty();
        
        if (domains.length === 0) {
            treeElement.html('<div class="no-results">No domains found in the file. Check if the TTL format is correct.</div>');
            return;
        }
        
        // Sort domains for consistency
        domains.sort((a, b) => {
            // If domains have numeric IDs, sort numerically
            if (a.startsWith(':domain') && b.startsWith(':domain')) {
                const numA = parseInt(a.replace(':domain', ''));
                const numB = parseInt(b.replace(':domain', ''));
                return numA - numB;
            }
            
            // Otherwise sort alphabetically
            const labelA = concepts.get(a)?.labels?.en || a;
            const labelB = concepts.get(b)?.labels?.en || b;
            return labelA.localeCompare(labelB);
        });
        
        // Create the tree
        domains.forEach(uri => {
            renderDomainNode(uri);
        });
        
        // Set up click handlers for expanding/collapsing
        $('.expander').on('click', function(e) {
            e.stopPropagation();
            const nodeContent = $(this).closest('.node-content');
            const node = nodeContent.closest('.tree-node');
            const uri = node.data('uri');
            
            if ($(this).hasClass('collapsed')) {
                // Expand
                $(this).removeClass('collapsed').addClass('expanded').text('-');
                
                // If children container is empty, load children
                const childrenContainer = node.find('> .children');
                if (childrenContainer.children().length === 0) {
                    const concept = concepts.get(uri);
                    if (concept) {
                        renderChildren(concept, childrenContainer);
                    }
                }
                
                // Show children
                node.find('> .children').removeClass('hidden');
            } else {
                // Collapse
                $(this).removeClass('expanded').addClass('collapsed').text('+');
                node.find('> .children').addClass('hidden');
            }
        });
        
        // Set up click handlers for node selection
        $('.node-content').on('click', function(e) {
            if (!$(e.target).hasClass('expander')) {
                $('.node-content').removeClass('selected');
                $(this).addClass('selected');
                
                const uri = $(this).closest('.tree-node').data('uri');
                if (uri && concepts.has(uri)) {
                    showDetails(concepts.get(uri));
                }
            }
        });
    }
    
    function renderDomainNode(uri) {
        if (!concepts.has(uri)) return;
        
        const concept = concepts.get(uri);
        const label = concept.labels.en || concept.uri;
        
        const node = $('<div>').addClass('tree-node').attr('data-uri', uri).attr('data-type', 'domain');
        const nodeContent = $('<div>').addClass('node-content');
        
        // Add expander if the domain has children
        if (concept.narrower.length > 0) {
            nodeContent.append($('<span>').addClass('expander collapsed').text('+'));
        } else {
            nodeContent.append($('<span>').addClass('spacer').text(' '));
        }
        
        // Add domain icon and label
        nodeContent.append($('<span>').addClass('icon icon-domain'));
        nodeContent.append($('<span>').addClass('label').text(label));
        
        // Container for children
        const childrenContainer = $('<div>').addClass('children hidden');
        
        node.append(nodeContent, childrenContainer);
        treeElement.append(node);
    }
    
    function renderChildren(concept, container) {
        // Sort children: microthesauri first, then concepts
        const sortedChildren = [...concept.narrower].sort((a, b) => {
            const conceptA = concepts.get(a);
            const conceptB = concepts.get(b);
            
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
        
        sortedChildren.forEach(childUri => {
            if (!concepts.has(childUri)) return;
            
            const childConcept = concepts.get(childUri);
            const label = childConcept.labels.en || childConcept.uri;
            const type = childConcept.type || 'concept';
            
            const childNode = $('<div>').addClass('tree-node').attr('data-uri', childUri).attr('data-type', type);
            const nodeContent = $('<div>').addClass('node-content');
            
            // Add expander if the child has children
            if (childConcept.narrower.length > 0) {
                nodeContent.append($('<span>').addClass('expander collapsed').text('+'));
            } else {
                nodeContent.append($('<span>').addClass('spacer').text(' '));
            }
            
            // Add appropriate icon based on type
            let iconClass = 'icon-concept';
            if (type === 'microThesaurus') {
                iconClass = 'icon-microThesaurus';
            } else if (type === 'domain') {
                iconClass = 'icon-domain';
            }
            
            nodeContent.append($('<span>').addClass(`icon ${iconClass}`));
            nodeContent.append($('<span>').addClass('label').text(label));
            
            // Container for this child's children
            const childChildrenContainer = $('<div>').addClass('children hidden');
            
            childNode.append(nodeContent, childChildrenContainer);
            container.append(childNode);
        });
    }
    
    function showDetails(concept) {
        if (!concept) {
            detailsElement.html('<p>No concept selected</p>');
            return;
        }
        
        const label = concept.labels.en || concept.uri;
        const type = concept.type || 'concept';
        
        let detailsHtml = `
            <div class="concept-details">
                <h3>${label}</h3>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>URI:</strong> ${concept.uri}</p>
        `;
        
        // Show labels in other languages
        const otherLabels = Object.entries(concept.labels).filter(([lang]) => lang !== 'en');
        if (otherLabels.length > 0) {
            detailsHtml += '<h4>Labels in other languages</h4><ul>';
            otherLabels.forEach(([lang, label]) => {
                detailsHtml += `<li><strong>${lang}:</strong> ${label}</li>`;
            });
            detailsHtml += '</ul>';
        }
        
        // Show broader concepts
        if (concept.broader.length > 0) {
            detailsHtml += '<h4>Broader Concepts</h4><ul>';
            concept.broader.forEach(uri => {
                if (concepts.has(uri)) {
                    const broaderConcept = concepts.get(uri);
                    const broaderLabel = broaderConcept.labels.en || uri;
                    detailsHtml += `<li>${broaderLabel} (${broaderConcept.type || 'concept'})</li>`;
                }
            });
            detailsHtml += '</ul>';
        }
        
        // Show narrower concepts
        if (concept.narrower.length > 0) {
            detailsHtml += '<h4>Narrower Concepts</h4><ul>';
            concept.narrower.forEach(uri => {
                if (concepts.has(uri)) {
                    const narrowerConcept = concepts.get(uri);
                    const narrowerLabel = narrowerConcept.labels.en || uri;
                    detailsHtml += `<li>${narrowerLabel} (${narrowerConcept.type || 'concept'})</li>`;
                }
            });
            detailsHtml += '</ul>';
        }
        
        // Show related concepts
        if (concept.related && concept.related.length > 0) {
            detailsHtml += '<h4>Related Concepts</h4><ul>';
            concept.related.forEach(uri => {
                if (concepts.has(uri)) {
                    const relatedConcept = concepts.get(uri);
                    const relatedLabel = relatedConcept.labels.en || uri;
                    detailsHtml += `<li>${relatedLabel} (${relatedConcept.type || 'concept'})</li>`;
                }
            });
            detailsHtml += '</ul>';
        }
        
        detailsHtml += '</div>';
        detailsElement.html(detailsHtml);
    }
});
