// UNESCO Thesaurus Explorer - SKOS/RDF Implementation
// Using rdflib.js for robust parsing of SKOS structures

$(document).ready(function() {
    // DOM elements
    const treeElement = $('#tree');
    const detailsElement = $('#conceptDetails');
    const statusElement = $('#status');
    
    // State variables
    let parser = null;
    let currentLanguage = 'en';
    let expandedNodes = new Set();
    
    // Add UI controls
    setupUIControls();
    
    // Initialize
    statusElement.text('Initializing parser...');
    
    // Check if rdflib is available
    if (typeof $rdf === 'undefined') {
        statusElement.text('Error: RDF library not loaded. Please refresh the page or check your internet connection.');
        return;
    }
    
    // Load the TTL file
    $.ajax({
        url: './unesco-thesaurus.ttl',
        dataType: 'text',
        success: function(data) {
            statusElement.text('File loaded, starting analysis...');
            console.log(`File loaded, size: ${data.length} bytes`);
            
            // Create and initialize the parser
            try {
                parser = new SKOSParser();
                parser.parseContent(data)
                    .then(() => {
                        statusElement.text(`Processing complete. Found ${parser.domains.length} domains, ${parser.microthesauri.length} microthesauri, and ${parser.concepts.size} concepts`);
                        renderTree();
                        setupEventHandlers();
                    })
                    .catch(error => {
                        console.error("Error parsing content:", error);
                        statusElement.text(`Error: ${error.message}`);
                        treeElement.html(`<div class="error">Error parsing file: ${error.message}</div>`);
                    });
            } catch (error) {
                console.error("Error initializing parser:", error);
                statusElement.text(`Error initializing parser: ${error.message}`);
                treeElement.html(`<div class="error">Error initializing parser: ${error.message}</div>`);
            }
        },
        error: function(xhr, status, error) {
            statusElement.text(`Failed to load file: ${error}`);
            treeElement.html(`<div class="error">Error loading file: ${error}</div>`);
            console.error('Error loading file:', error);
        }
    });
    
    /**
     * Set up UI controls
     */
    function setupUIControls() {
        // Add search input and language selector to the UI
        const controlsHtml = `
            <div class="controls">
                <input type="text" id="searchInput" placeholder="Search concepts...">
                <button id="searchButton">Search</button>
                <select id="languageSelector">
                    <option value="en">English</option>
                </select>
            </div>
        `;
        
        treeElement.before(controlsHtml);
    }
    
    /**
     * Set up event handlers
     */
    function setupEventHandlers() {
        // Set up tree interaction handlers
        setupTreeInteractions();
        
        // Set up search functionality
        setupSearch();
        
        // Set up language selector
        setupLanguageSelector();
    }
    
    /**
     * Render the hierarchical tree
     */
    function renderTree() {
        treeElement.empty();
        
        if (!parser || parser.domains.length === 0) {
            treeElement.html('<div class="no-results">No domains found in the file. Check if the TTL format is correct.</div>');
            return;
        }
        
        // Get the hierarchical tree from the parser
        const tree = parser.getHierarchicalTree();
        
        // Render each domain
        tree.forEach(domain => {
            renderNode(domain, treeElement, 0);
        });
    }
    
    /**
     * Render a single tree node and its children
     * @param {Object} node - The node to render
     * @param {jQuery} container - The container to append the node to
     * @param {number} level - The nesting level
     */
    function renderNode(node, container, level) {
        const nodeElement = $('<div>').addClass('tree-node').attr('data-uri', node.uri).attr('data-type', node.type);
        const nodeContent = $('<div>').addClass('node-content');
        
        // Add expander if the node has children
        if (node.children && node.children.length > 0) {
            nodeContent.append($('<span>').addClass('expander collapsed').text('+'));
        } else {
            nodeContent.append($('<span>').addClass('spacer').text(' '));
        }
        
        // Add icon based on node type
        let iconClass = 'icon-concept';
        if (node.type === 'domain') {
            iconClass = 'icon-domain';
        } else if (node.type === 'microThesaurus') {
            iconClass = 'icon-microThesaurus';
        } else if (node.type === 'conceptScheme') {
            iconClass = 'icon-conceptScheme';
        }
        
        nodeContent.append($('<span>').addClass(`icon ${iconClass}`));
        
        // Add label
        const label = parser.concepts.get(node.uri)?.labels[currentLanguage] || node.label;
        nodeContent.append($('<span>').addClass('label').text(label));
        
        // Container for children
        const childrenContainer = $('<div>').addClass('children hidden');
        
        // Render children
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                renderNode(child, childrenContainer, level + 1);
            });
        }
        
        nodeElement.append(nodeContent, childrenContainer);
        container.append(nodeElement);
    }
    
    /**
     * Set up click handlers for tree interactions
     */
    function setupTreeInteractions() {
        // Expander click handler
        $('.expander').on('click', function(e) {
            e.stopPropagation();
            const nodeContent = $(this).closest('.node-content');
            const node = nodeContent.closest('.tree-node');
            const uri = node.data('uri');
            
            if ($(this).hasClass('collapsed')) {
                // Expand
                $(this).removeClass('collapsed').addClass('expanded').text('-');
                node.find('> .children').removeClass('hidden');
                expandedNodes.add(uri);
            } else {
                // Collapse
                $(this).removeClass('expanded').addClass('collapsed').text('+');
                node.find('> .children').addClass('hidden');
                expandedNodes.delete(uri);
            }
        });
        
        // Node selection handler
        $('.node-content').on('click', function(e) {
            if (!$(e.target).hasClass('expander')) {
                $('.node-content').removeClass('selected');
                $(this).addClass('selected');
                
                const uri = $(this).closest('.tree-node').data('uri');
                if (uri && parser.concepts.has(uri)) {
                    showDetails(uri);
                }
            }
        });
    }
    
    /**
     * Set up search functionality
     */
    function setupSearch() {
        const searchInput = $('#searchInput');
        const searchButton = $('#searchButton');
        
        // Search button click handler
        searchButton.on('click', function() {
            performSearch(searchInput.val().trim());
        });
        
        // Enter key press handler
        searchInput.on('keypress', function(e) {
            if (e.which === 13) { // Enter key
                performSearch(searchInput.val().trim());
            }
        });
    }
    
    /**
     * Set up language selector
     */
    function setupLanguageSelector() {
        // Find available languages from the concepts
        const languages = new Set(['en']); // Always include English
        
        parser.concepts.forEach(concept => {
            Object.keys(concept.labels).forEach(lang => {
                languages.add(lang);
            });
        });
        
        // Clear and rebuild language selector
        const languageSelector = $('#languageSelector');
        languageSelector.empty();
        
        // Add languages to selector
        Array.from(languages).sort().forEach(lang => {
            languageSelector.append($('<option>').attr('value', lang).text(getLanguageName(lang)));
        });
        
        // Set current language
        languageSelector.val(currentLanguage);
        
        // Language change handler
        languageSelector.on('change', function() {
            currentLanguage = $(this).val();
            renderTree();
            
            // Re-expand previously expanded nodes
            expandedNodes.forEach(uri => {
                const node = $(`.tree-node[data-uri="${uri}"]`);
                const expander = node.find('> .node-content > .expander');
                if (expander.length > 0) {
                    expander.removeClass('collapsed').addClass('expanded').text('-');
                    node.find('> .children').removeClass('hidden');
                }
            });
            
            // Reattach tree interaction handlers
            setupTreeInteractions();
        });
    }
    
    /**
     * Get the full language name from a language code
     * @param {string} code - The language code
     * @returns {string} - The language name
     */
    function getLanguageName(code) {
        const languages = {
            'en': 'English',
            'fr': 'French',
            'es': 'Spanish',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ar': 'Arabic'
        };
        
        return languages[code] || code;
    }
    
    /**
     * Perform a search through the concepts
     * @param {string} query - The search query
     */
    function performSearch(query) {
        if (!query) {
            // Clear search results
            $('.node-content').removeClass('search-match');
            statusElement.text(`Search cleared. Showing all concepts.`);
            return;
        }
        
        query = query.toLowerCase();
        let matchCount = 0;
        
        // Clear previous search results
        $('.node-content').removeClass('search-match');
        
        // Search through all concepts
        parser.concepts.forEach((concept, uri) => {
            let isMatch = false;
            
            // Search in labels
            for (const [lang, label] of Object.entries(concept.labels)) {
                if (label.toLowerCase().includes(query)) {
                    isMatch = true;
                    break;
                }
            }
            
            // Mark matching nodes
            if (isMatch) {
                matchCount++;
                const node = $(`.tree-node[data-uri="${uri}"]`);
                node.find('> .node-content').addClass('search-match');
                
                // Expand path to node
                expandPathToNode(node);
            }
        });
        
        statusElement.text(`Found ${matchCount} matches for "${query}"`);
        
        // If there's only one match, select it
        if (matchCount === 1) {
            const matchNode = $('.node-content.search-match');
            matchNode.click();
        }
    }
    
    /**
     * Expand the path to a node
     * @param {jQuery} node - The node to expand to
     */
    function expandPathToNode(node) {
        let parent = node.parent().closest('.tree-node');
        while (parent.length > 0) {
            const expander = parent.find('> .node-content > .expander');
            if (expander.hasClass('collapsed')) {
                expander.removeClass('collapsed').addClass('expanded').text('-');
                parent.find('> .children').removeClass('hidden');
                expandedNodes.add(parent.data('uri'));
            }
            parent = parent.parent().closest('.tree-node');
        }
    }
    
    /**
     * Show detailed information about a concept
     * @param {string} uri - The URI of the concept
     */
    function showDetails(uri) {
        const details = parser.getConceptDetails(uri);
        if (!details) {
            detailsElement.html('<p>No concept selected</p>');
            return;
        }
        
        const label = details.labels[currentLanguage] || details.labels.en || uri;
        const type = details.type || 'concept';
        
        let detailsHtml = `
            <div class="concept-details">
                <h3>${label}</h3>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>URI:</strong> ${uri}</p>
        `;
        
        // Show definitions if available
        if (details.definitions) {
            const definition = details.definitions[currentLanguage] || details.definitions.en;
            if (definition) {
                detailsHtml += `<div class="definition">
                    <h4>Definition</h4>
                    <p>${definition}</p>
                </div>`;
            }
        }
        
        // Show scope notes if available
        if (details.scopeNotes) {
            const scopeNote = details.scopeNotes[currentLanguage] || details.scopeNotes.en;
            if (scopeNote) {
                detailsHtml += `<div class="scope-note">
                    <h4>Scope Note</h4>
                    <p>${scopeNote}</p>
                </div>`;
            }
        }
        
        // Show labels in other languages
        const otherLabels = Object.entries(details.labels).filter(([lang]) => lang !== currentLanguage);
        if (otherLabels.length > 0) {
            detailsHtml += '<div class="other-labels"><h4>Labels in other languages</h4><ul>';
            otherLabels.forEach(([lang, label]) => {
                detailsHtml += `<li><strong>${getLanguageName(lang)}:</strong> ${label}</li>`;
            });
            detailsHtml += '</ul></div>';
        }
        
        // Show broader concepts
        if (details.broader.length > 0) {
            detailsHtml += '<div class="related-concepts"><h4>Broader Concepts</h4><ul>';
            details.broader.forEach(concept => {
                detailsHtml += `<li><a href="#" class="concept-link" data-uri="${concept.uri}">${concept.label}</a> (${concept.type})</li>`;
            });
            detailsHtml += '</ul></div>';
        }
        
        // Show narrower concepts
        if (details.narrower.length > 0) {
            detailsHtml += '<div class="related-concepts"><h4>Narrower Concepts</h4><ul>';
            details.narrower.forEach(concept => {
                detailsHtml += `<li><a href="#" class="concept-link" data-uri="${concept.uri}">${concept.label}</a> (${concept.type})</li>`;
            });
            detailsHtml += '</ul></div>';
        }
        
        // Show related concepts
        if (details.related && details.related.length > 0) {
            detailsHtml += '<div class="related-concepts"><h4>Related Concepts</h4><ul>';
            details.related.forEach(concept => {
                detailsHtml += `<li><a href="#" class="concept-link" data-uri="${concept.uri}">${concept.label}</a> (${concept.type})</li>`;
            });
            detailsHtml += '</ul></div>';
        }
        
        detailsHtml += '</div>';
        detailsElement.html(detailsHtml);
        
        // Set up click handlers for concept links
        $('.concept-link').on('click', function(e) {
            e.preventDefault();
            const linkedUri = $(this).data('uri');
            
            // Find the node in the tree
            const node = $(`.tree-node[data-uri="${linkedUri}"]`);
            if (node.length > 0) {
                // Expand path to the node
                expandPathToNode(node);
                
                // Select the node
                $('.node-content').removeClass('selected');
                node.find('> .node-content').addClass('selected');
                
                // Show details
                showDetails(linkedUri);
                
                // Scroll to the node
                $('html, body').animate({
                    scrollTop: node.offset().top - 100
                }, 500);
            }
        });
    }
});