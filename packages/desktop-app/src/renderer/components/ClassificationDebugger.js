"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
/**
 * A utility component to debug and view content classifications
 */
const ClassificationDebugger = () => {
    const [contentItems, setContentItems] = (0, react_1.useState)([]);
    const [selectedItem, setSelectedItem] = (0, react_1.useState)(null);
    const [taxonomyData, setTaxonomyData] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
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
            }
            catch (error) {
                setError(`Error loading data: ${error.message || 'Unknown error'}`);
                setLoading(false);
            }
        }
        loadData();
    }, []);
    // Get concept label from ID using taxonomy data
    const getConceptLabel = (conceptId) => {
        const concept = taxonomyData.find(c => c.id === conceptId);
        return concept ? concept.prefLabel : conceptId;
    };
    // Load a specific content item with its full data
    const handleSelectItem = async (itemId) => {
        try {
            const item = await window.electronAPI.getItemWithContent(itemId);
            setSelectedItem(item);
        }
        catch (error) {
            setError(`Error loading item: ${error.message || 'Unknown error'}`);
        }
    };
    // Manually trigger classification for current content
    const handleClassifyContent = async () => {
        if (!selectedItem)
            return;
        try {
            const classifications = await window.electronAPI.classifyContent(selectedItem.title, selectedItem.content);
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
                setContentItems(items => items.map(item => item.id === selectedItem.id ? { ...item, concepts: classifications } : item));
            }
        }
        catch (error) {
            setError(`Error classifying content: ${error.message || 'Unknown error'}`);
        }
    };
    if (loading) {
        return react_1.default.createElement("div", null, "Loading content items...");
    }
    if (error) {
        return react_1.default.createElement("div", { className: "error" }, error);
    }
    return (react_1.default.createElement("div", { className: "classification-debugger" },
        react_1.default.createElement("h2", null, "Classification Debugger"),
        react_1.default.createElement("div", { className: "content-list" },
            react_1.default.createElement("h3", null, "Content Items"),
            contentItems.length === 0 ? (react_1.default.createElement("p", null, "No content items found. Add some content first.")) : (react_1.default.createElement("ul", null, contentItems.map(item => (react_1.default.createElement("li", { key: item.id, onClick: () => handleSelectItem(item.id) },
                react_1.default.createElement("strong", null, item.title),
                item.concepts && item.concepts.length > 0 && (react_1.default.createElement("span", { className: "concept-count" },
                    "(",
                    item.concepts.length,
                    " concept",
                    item.concepts.length !== 1 ? 's' : '',
                    ")")))))))),
        selectedItem && (react_1.default.createElement("div", { className: "item-details" },
            react_1.default.createElement("h3", null,
                "Selected Item: ",
                selectedItem.title),
            react_1.default.createElement("div", { className: "actions" },
                react_1.default.createElement("button", { onClick: handleClassifyContent }, "Classify This Content")),
            react_1.default.createElement("div", { className: "concepts" },
                react_1.default.createElement("h4", null, "Classifications"),
                !selectedItem.concepts || selectedItem.concepts.length === 0 ? (react_1.default.createElement("p", null, "No classifications found for this item.")) : (react_1.default.createElement("table", null,
                    react_1.default.createElement("thead", null,
                        react_1.default.createElement("tr", null,
                            react_1.default.createElement("th", null, "Concept"),
                            react_1.default.createElement("th", null, "Confidence"),
                            react_1.default.createElement("th", null, "Classified At"),
                            react_1.default.createElement("th", null, "User Verified"))),
                    react_1.default.createElement("tbody", null, selectedItem.concepts.map((concept, index) => (react_1.default.createElement("tr", { key: index },
                        react_1.default.createElement("td", null, getConceptLabel(concept.conceptId)),
                        react_1.default.createElement("td", null,
                            (concept.confidence * 100).toFixed(2),
                            "%"),
                        react_1.default.createElement("td", null, new Date(concept.classifiedAt).toLocaleString()),
                        react_1.default.createElement("td", null, concept.userVerified ? 'Yes' : 'No')))))))),
            react_1.default.createElement("div", { className: "content-preview" },
                react_1.default.createElement("h4", null, "Content Preview"),
                react_1.default.createElement("div", { className: "content-text" }, selectedItem.content && selectedItem.content.length > 500
                    ? `${selectedItem.content.substring(0, 500)}...`
                    : selectedItem.content)))),
        react_1.default.createElement("style", null, `
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
        `)));
};
exports.default = ClassificationDebugger;
//# sourceMappingURL=ClassificationDebugger.js.map