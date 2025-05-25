import React, { useState, useEffect } from 'react';

/**
 * A utility component to debug and view content classifications
 */
const ClassificationDebugger: React.FC = () => {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [taxonomyData, setTaxonomyData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [classifying, setClassifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Helper function to add debug information
  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${message}`);
    console.log(`[ClassificationDebugger] ${message}`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        addDebugInfo('Starting to load data...');
        
        // Check if electronAPI is available
        if (!window.electronAPI) {
          throw new Error('electronAPI is not available. Make sure the preload script is properly loaded.');
        }
        addDebugInfo('electronAPI is available');
        
        // Load content items
        addDebugInfo('Loading content items...');
        const items = await window.electronAPI.getAllItems();
        addDebugInfo(`Loaded ${items?.length || 0} content items`);
        setContentItems(items || []);
        
        // Load taxonomy concepts for displaying labels
        addDebugInfo('Loading taxonomy concepts...');
        const concepts = await window.electronAPI.getTaxonomyConcepts();
        addDebugInfo(`Loaded ${concepts?.length || 0} taxonomy concepts`);
        setTaxonomyData(concepts || []);
        
        addDebugInfo('Data loading completed successfully');
        setLoading(false);
      } catch (error) {
        const errorMessage = `Error loading data: ${(error as Error).message || 'Unknown error'}`;
        addDebugInfo(errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Get concept label from ID using taxonomy data
  const getConceptLabel = (conceptId: string): string => {
    const concept = taxonomyData.find(c => c.id === conceptId);
    return concept ? concept.prefLabel : conceptId;
  };
  
  // Load a specific content item with its full data
  const handleSelectItem = async (itemId: string) => {
    try {
      addDebugInfo(`Selecting item with ID: ${itemId}`);
      const item = await window.electronAPI.getItemWithContent(itemId);
      addDebugInfo(`Item loaded: ${item?.title || 'Unknown title'}`);
      addDebugInfo(`Item has content: ${!!item?.content}, content length: ${item?.content?.length || 0}`);
      addDebugInfo(`Item has ${item?.concepts?.length || 0} existing concepts`);
      setSelectedItem(item);
      setError(null); // Clear any previous errors
    } catch (error) {
      const errorMessage = `Error loading item: ${(error as Error).message || 'Unknown error'}`;
      addDebugInfo(errorMessage);
      setError(errorMessage);
    }
  };
  
  // Manually trigger classification for current content
  const handleClassifyContent = async () => {
    addDebugInfo('Classification button clicked');
    
    if (!selectedItem) {
      const errorMessage = 'No item selected for classification';
      addDebugInfo(errorMessage);
      setError(errorMessage);
      return;
    }
    
    addDebugInfo(`Starting classification for item: ${selectedItem.title}`);
    addDebugInfo(`Item content length: ${selectedItem.content?.length || 0}`);
    
    try {
      setClassifying(true);
      setError(null);
      
      // Check if classification is available
      addDebugInfo('Checking if classification is available...');
      const isAvailable = await window.electronAPI.isClassificationAvailable();
      addDebugInfo(`Classification available: ${isAvailable}`);
      
      if (!isAvailable) {
        throw new Error('Classification service is not available. Please check if the classification models are properly initialized.');
      }
      
      // Check classification service status
      addDebugInfo('Getting classification service status...');
      const status = await window.electronAPI.getClassificationServiceStatus();
      addDebugInfo(`Classification service status: ${JSON.stringify(status)}`);
      
      // Verify we have the required data
      if (!selectedItem.title && !selectedItem.content) {
        throw new Error('Selected item has no title or content to classify');
      }
      
      addDebugInfo('Calling classifyContent...');
      
      // Log the content being sent for classification
      const contentToClassify = selectedItem.content || '';
      const titleToClassify = selectedItem.title || '';
      
      addDebugInfo(`Title to classify: "${titleToClassify}"`);
      addDebugInfo(`Content preview (first 200 chars): "${contentToClassify.substring(0, 200)}..."`); 
      addDebugInfo(`Raw content type: ${typeof contentToClassify}`);
      
      // Check if content is mostly HTML
      const htmlTagCount = (contentToClassify.match(/<[^>]*>/g) || []).length;
      const textLength = contentToClassify.replace(/<[^>]*>/g, '').length;
      addDebugInfo(`HTML tags found: ${htmlTagCount}, Clean text length: ${textLength}`);
      
      if (htmlTagCount > textLength / 20) {
        addDebugInfo('⚠️ WARNING: Content appears to be mostly HTML - this may affect classification');
        
        // Show cleaned content preview
        const cleanedContent = contentToClassify.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        addDebugInfo(`Cleaned content preview: "${cleanedContent.substring(0, 200)}..."`);
      }
      
      const classifications = await window.electronAPI.classifyContent(
        titleToClassify,
        contentToClassify
      );
      
      addDebugInfo(`Classification service response type: ${typeof classifications}`);
      addDebugInfo(`Classification service response: ${JSON.stringify(classifications)}`);
      
      // Debug what was actually matched
      if (classifications && classifications.length > 0) {
        classifications.forEach((cls: any, index: number) => {
          const concept = taxonomyData.find(c => c.id === cls.conceptId);
          addDebugInfo(`Match ${index + 1}: ${concept?.prefLabel || cls.conceptId} (confidence: ${cls.confidence})`);
        });
      }
      
      addDebugInfo(`Classification completed. Found ${classifications?.length || 0} classifications`);
      
      // Update the item with new classifications
      if (classifications && classifications.length > 0) {
        const updatedItem = {
          ...selectedItem,
          concepts: classifications
        };
        
        addDebugInfo('Saving classifications to storage...');
        // Save to storage
        await window.electronAPI.updateConcepts(selectedItem.id, classifications);
        addDebugInfo('Classifications saved successfully');
        
        // Update UI
        setSelectedItem(updatedItem);
        
        // Update the item in the list
        setContentItems(items => 
          items.map(item => 
            item.id === selectedItem.id ? { ...item, concepts: classifications } : item
          )
        );
        
        addDebugInfo('UI updated with new classifications');
      } else {
        addDebugInfo('No classifications returned from the service');
      }
    } catch (error) {
      const errorMessage = `Error classifying content: ${(error as Error).message || 'Unknown error'}`;
      addDebugInfo(errorMessage);
      setError(errorMessage);
    } finally {
      setClassifying(false);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo('');
  };

  if (loading) {
    return <div>Loading content items...</div>;
  }

  return (
    <div className="classification-debugger">
      <h2>Classification Debugger</h2>
      
      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px', fontSize: '12px' }}>
            Clear
          </button>
        </div>
      )}
      
      <div className="content-list">
        <h3>Content Items</h3>
        {contentItems.length === 0 ? (
          <p>No content items found. Add some content first.</p>
        ) : (
          <ul>
            {contentItems.map(item => (
              <li key={item.id} onClick={() => handleSelectItem(item.id)}>
                <strong>{item.title}</strong>
                {item.concepts && item.concepts.length > 0 && (
                  <span className="concept-count"> 
                    ({item.concepts.length} concept{item.concepts.length !== 1 ? 's' : ''})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {selectedItem && (
        <div className="item-details">
          <h3>Selected Item: {selectedItem.title}</h3>
          
          <div className="actions">
            <button 
              onClick={handleClassifyContent} 
              disabled={classifying}
              className={classifying ? 'classifying' : ''}
            >
              {classifying ? 'Classifying...' : 'Classify This Content'}
            </button>
          </div>
          
          <div className="concepts">
            <h4>Classifications</h4>
            {!selectedItem.concepts || selectedItem.concepts.length === 0 ? (
              <p>No classifications found for this item.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Concept</th>
                    <th>Confidence</th>
                    <th>Classified At</th>
                    <th>User Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItem.concepts.map((concept: any, index: number) => (
                    <tr key={index}>
                      <td>{getConceptLabel(concept.conceptId)}</td>
                      <td>{(concept.confidence * 100).toFixed(2)}%</td>
                      <td>{new Date(concept.classifiedAt).toLocaleString()}</td>
                      <td>{concept.userVerified ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="content-preview">
            <h4>Content Preview</h4>
            <div className="content-text">
              {selectedItem.content && selectedItem.content.length > 500 
                ? `${selectedItem.content.substring(0, 500)}...` 
                : selectedItem.content || 'No content available'}
            </div>
          </div>
        </div>
      )}
      
      <div className="debug-section">
        <h4>Debug Information</h4>
        <div className="debug-controls">
          <button onClick={clearDebugInfo} disabled={!debugInfo}>
            Clear Debug Info
          </button>
        </div>
        <pre className="debug-output">
          {debugInfo || 'No debug information yet. Try selecting an item or clicking "Classify This Content".'}
        </pre>
      </div>
      
      <style>
        {`
        .classification-debugger {
          padding: 20px;
          font-family: sans-serif;
        }
        .content-list {
          margin-bottom: 20px;
        }
        .content-list ul {
          list-style-type: none;
          padding: 0;
        }
        .content-list li {
          padding: 8px 12px;
          border: 1px solid #ddd;
          margin-bottom: 8px;
          cursor: pointer;
          border-radius: 4px;
        }
        .content-list li:hover {
          background-color: #f5f5f5;
        }
        .concept-count {
          color: #666;
          font-size: 0.9em;
        }
        .item-details {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .actions {
          margin-bottom: 15px;
        }
        button {
          padding: 8px 16px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover:not(:disabled) {
          background-color: #45a049;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        button.classifying {
          background-color: #ff9800;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
        }
        .content-preview {
          margin-top: 20px;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
          max-height: 300px;
          overflow-y: auto;
        }
        .error {
          color: red;
          padding: 10px;
          border: 1px solid red;
          border-radius: 4px;
          background-color: #fff8f8;
          margin-bottom: 20px;
        }
        .debug-section {
          margin-top: 30px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 15px;
          background-color: #fafafa;
        }
        .debug-controls {
          margin-bottom: 10px;
        }
        .debug-output {
          background-color: #000;
          color: #0f0;
          padding: 10px;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          white-space: pre-wrap;
        }
        `}
      </style>
    </div>
  );
};

export default ClassificationDebugger;