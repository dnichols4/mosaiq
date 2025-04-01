/**
 * Dependency Check Utility
 * Verifies that all required libraries are properly loaded
 */
function checkDependencies() {
    const dependencies = [
        { name: 'jQuery', check: () => typeof jQuery !== 'undefined' },
        { name: 'rdflib.js', check: () => typeof $rdf !== 'undefined' },
        { name: 'SKOSParser', check: () => typeof SKOSParser !== 'undefined' }
    ];
    
    let allLoaded = true;
    const statusEl = document.getElementById('dependencies-status');
    
    if (statusEl) {
        statusEl.innerHTML = '';
        dependencies.forEach(dep => {
            const loaded = dep.check();
            allLoaded = allLoaded && loaded;
            
            const item = document.createElement('div');
            item.className = loaded ? 'dependency-loaded' : 'dependency-missing';
            item.textContent = `${dep.name}: ${loaded ? 'Loaded' : 'Missing'}`;
            statusEl.appendChild(item);
        });
        
        const summaryEl = document.createElement('div');
        summaryEl.className = allLoaded ? 'all-loaded' : 'missing-dependencies';
        summaryEl.textContent = allLoaded 
            ? 'All dependencies loaded successfully!' 
            : 'Some dependencies failed to load. Please check your internet connection or try a different browser.';
        statusEl.appendChild(summaryEl);
    }
    
    return allLoaded;
}

// Run check when the page loads
window.addEventListener('load', function() {
    // Add status container if it doesn't exist
    if (!document.getElementById('dependencies-status')) {
        const container = document.createElement('div');
        container.id = 'dependencies-status';
        container.className = 'debug-info';
        
        // Add container after status element
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.parentNode.insertBefore(container, statusEl.nextSibling);
        } else {
            // Fallback to appending to body
            document.body.appendChild(container);
        }
    }
    
    checkDependencies();
});