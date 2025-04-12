import React, { useState, useEffect } from 'react';

/**
 * A utility component to debug and view content classifications
 */
const ClassificationDebugger: React.FC = () => {
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [taxonomyData, setTaxonomyData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load content items
        const items = await window.electronAPI.getAllItems();
        setContentItems(items || []);
        
        // Load taxonomy concepts for displaying labels
        const concepts = await window.electronAPI.getTaxonomyConcepts();
        setTaxonomyData(concepts || []);
        
        setLoading(false);
      } catch (error) {
        setError(`Error loading data: ${(error as Error).message || 'Unknown error'}`);
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
      const item = await window.electronAPI.getItemWithContent(itemId);
      setSelectedItem(item);
    } catch (error) {
      setError(`Error loading item: ${(error as Error).message || 'Unknown error'}`);
    }
  };
  
  // Manually trigger classification for current content
  const handleClassifyContent = async () => {
    if (!selectedItem) return;
    
    try {
      const classifications = await window.electronAPI.classifyContent(
        selectedItem.title,
        selectedItem.content
      );
      
      // Update the item with new classifications
      if (classifications && classifications.length > 0) {
        const updatedItem = {
          ...selectedItem,
          concepts: classifications
        };
        
        // Save to storage
        await window.electronAPI.updateConcepts(selectedItem.id, classifications);
        
        // Update UI
        setSelectedItem(updatedItem);
        
        // Update the item in the list
        setContentItems(items => 
          items.map(item => 
            item.id === selectedItem.id ? { ...item, concepts: classifications } : item
          )
        );
      }
    } catch (error) {
      setError(`Error classifying content: ${(error as Error).message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div>Loading content items...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="classification-debugger">
      <h2>Classification Debugger</h2>
      
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
            <button onClick={handleClassifyContent}>Classify This Content</button>
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
                : selectedItem.content}
            </div>
          </div>
        </div>
      )}
      
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
        button:hover {
          background-color: #45a049;
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
        }
        `}
      </style>
    </div>
  );
};

export default ClassificationDebugger;
