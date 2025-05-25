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
exports.HomePage = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const common_ui_1 = require("@mosaiq/common-ui");
const ListView_1 = require("../components/ListView/ListView");
const GridView_1 = require("../components/GridView/GridView");
const PlatformDialogExample_1 = require("../components/examples/PlatformDialogExample");
require("./HomePage.css");
const HomePage = ({ platformCapabilities }) => {
    const [items, setItems] = (0, react_1.useState)([]);
    const [filteredItems, setFilteredItems] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [isOnline, setIsOnline] = (0, react_1.useState)(false);
    const [viewMode, setViewMode] = (0, react_1.useState)('list');
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [spotlightMode, setSpotlightMode] = (0, react_1.useState)(null);
    const navigate = (0, react_router_dom_1.useNavigate)();
    // Load all items on component mount
    (0, react_1.useEffect)(() => {
        loadItems();
        // Check online status if platformCapabilities is available
        if (platformCapabilities) {
            checkOnlineStatus();
        }
    }, [platformCapabilities]);
    // Filter items when search term or items change
    (0, react_1.useEffect)(() => {
        if (searchTerm.trim() === '') {
            setFilteredItems(items);
        }
        else {
            const normalizedSearchTerm = searchTerm.toLowerCase();
            const filtered = items.filter(item => {
                return (item.title.toLowerCase().includes(normalizedSearchTerm) ||
                    (item.author && item.author.toLowerCase().includes(normalizedSearchTerm)) ||
                    (item.excerpt && item.excerpt.toLowerCase().includes(normalizedSearchTerm)) ||
                    (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(normalizedSearchTerm))));
            });
            setFilteredItems(filtered);
        }
    }, [items, searchTerm]);
    // Check online status
    const checkOnlineStatus = async () => {
        if (platformCapabilities && typeof platformCapabilities.isOnline === 'function') {
            try {
                const online = await platformCapabilities.isOnline();
                setIsOnline(online);
            }
            catch (error) {
                console.error('Error checking online status:', error);
                setIsOnline(false);
            }
        }
    };
    // Load all items from storage
    const loadItems = async () => {
        try {
            const allItems = await window.electronAPI.getAllItems();
            setItems(allItems);
            setFilteredItems(allItems);
        }
        catch (error) {
            console.error('Error loading items:', error);
        }
    };
    // Handle URL submission
    const handleUrlSubmit = async (url) => {
        setIsLoading(true);
        try {
            await window.electronAPI.saveUrl(url);
            loadItems();
        }
        catch (error) {
            console.error('Error saving URL:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Handle search submission
    const handleSearchSubmit = (term) => {
        setSearchTerm(term);
    };
    // Handle item click
    const handleItemClick = (id) => {
        navigate(`/reader/${id}`);
    };
    // Handle item deletion
    const handleItemDelete = async (id, event) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await window.electronAPI.deleteItem(id);
                // Reload items after deletion
                loadItems();
            }
            catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };
    // Navigate to settings
    const goToSettings = () => {
        navigate('/settings');
    };
    // Format date for list view
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        }
        catch (error) {
            return 'Unknown';
        }
    };
    // Format time for list view
    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        catch (error) {
            return '';
        }
    };
    // Get source icon based on URL
    const getSourceIcon = (item) => {
        if (item.source?.includes('medium.com')) {
            return "📝";
        }
        else if (item.source?.includes('github.com')) {
            return "🧑‍💻";
        }
        else if (item.source?.includes('youtube.com')) {
            return "🎬";
        }
        else {
            return "📄";
        }
    };
    return (react_1.default.createElement("div", { className: "home-container" },
        react_1.default.createElement("header", { className: "home-header" },
            react_1.default.createElement("h1", null, "mosaiq"),
            react_1.default.createElement("div", { className: "header-controls" },
                react_1.default.createElement(common_ui_1.SearchIcon, { onClick: () => setSpotlightMode('search'), className: searchTerm ? 'active' : '' }),
                react_1.default.createElement(common_ui_1.AddIcon, { onClick: () => setSpotlightMode('url') }),
                react_1.default.createElement("div", { className: "view-toggle" },
                    react_1.default.createElement(common_ui_1.GridIcon, { onClick: () => setViewMode('grid'), className: viewMode === 'grid' ? 'active' : '' }),
                    react_1.default.createElement(common_ui_1.ListIcon, { onClick: () => setViewMode('list'), className: viewMode === 'list' ? 'active' : '' })),
                react_1.default.createElement(common_ui_1.SettingsIcon, { onClick: goToSettings }))),
        platformCapabilities && (react_1.default.createElement("div", { className: "platform-info" },
            "Platform: ",
            platformCapabilities.type,
            isOnline && ' • Online')),
        react_1.default.createElement(common_ui_1.SpotlightInput, { isOpen: spotlightMode !== null, onClose: () => setSpotlightMode(null), mode: spotlightMode || 'search', onSubmit: spotlightMode === 'search' ? handleSearchSubmit : handleUrlSubmit, placeholder: spotlightMode === 'search' ? 'Search articles...' : 'Enter URL to save', initialValue: spotlightMode === 'search' ? searchTerm : '' }),
        searchTerm && (react_1.default.createElement("div", { className: "search-results-info" },
            "Showing ",
            filteredItems.length,
            " of ",
            items.length,
            " articles matching \"",
            searchTerm,
            "\"",
            react_1.default.createElement("button", { className: "clear-search-button", onClick: () => setSearchTerm(''), "aria-label": "Clear search" }, "Clear"))),
        isLoading && (react_1.default.createElement("div", { className: "loading-indicator" }, "Saving content...")),
        viewMode === 'grid' ? (react_1.default.createElement(GridView_1.GridView, { items: filteredItems, onItemClick: handleItemClick, onDeleteItem: (id, e) => handleItemDelete(id, e), formatDate: formatDate, getSourceIcon: getSourceIcon })) : (react_1.default.createElement(ListView_1.ListView, { items: filteredItems, onItemClick: handleItemClick, onDeleteItem: (id, e) => handleItemDelete(id, e), formatDate: formatDate, formatTime: formatTime, getSourceIcon: getSourceIcon })),
        filteredItems.length === 0 && (react_1.default.createElement("div", { className: "empty-state" },
            react_1.default.createElement("p", null, searchTerm ? 'No articles match your search.' : 'No content saved yet.'),
            !searchTerm && (react_1.default.createElement("p", null, "Click the + button to add content from a URL.")))),
        react_1.default.createElement("div", { className: "platform-examples-section" },
            react_1.default.createElement("h2", null, "Platform UI Examples"),
            react_1.default.createElement("p", null, "This section demonstrates the platform dialog and file picker abstractions."),
            react_1.default.createElement(PlatformDialogExample_1.PlatformDialogExample, null)),
        react_1.default.createElement("style", null, `
        .platform-examples-section {
          margin-top: 40px;
          padding: 20px;
          border-top: 1px solid #ccc;
        }
      `)));
};
exports.HomePage = HomePage;
//# sourceMappingURL=HomePage.js.map