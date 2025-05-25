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
exports.ReaderPage = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const common_ui_1 = require("@mosaiq/common-ui");
const ThemeProvider_1 = require("../providers/ThemeProvider");
require("../styles/reader.css");
const ReaderPage = () => {
    const { theme, setTheme } = (0, ThemeProvider_1.useTheme)();
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [content, setContent] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [readingSettings, setReadingSettings] = (0, react_1.useState)({
        fontSize: '18px',
        lineHeight: '1.6',
        theme: 'light',
        width: '800px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    // Load content and settings on component mount
    (0, react_1.useEffect)(() => {
        if (!id)
            return;
        const loadContent = async () => {
            try {
                setLoading(true);
                // Load content
                const contentData = await window.electronAPI.getItemWithContent(id);
                setContent(contentData);
                // Load reading settings
                const settings = await window.electronAPI.getReadingSettings();
                setReadingSettings(settings);
            }
            catch (err) {
                console.error('Error loading content:', err);
                setError('Error loading content. Please try again.');
            }
            finally {
                setLoading(false);
            }
        };
        loadContent();
    }, [id]);
    // Handle reading settings changes
    const handleSettingsChange = async (settings) => {
        try {
            const updatedSettings = await window.electronAPI.updateReadingSettings(settings);
            setReadingSettings(updatedSettings);
            // Update global theme if theme setting changed
            if (settings.theme && settings.theme !== theme) {
                setTheme(settings.theme);
            }
        }
        catch (error) {
            console.error('Error updating reading settings:', error);
        }
    };
    // Go back to home page
    const goBack = () => {
        navigate('/');
    };
    // Delete current article
    const handleDelete = async () => {
        if (!id)
            return;
        if (window.confirm('Are you sure you want to delete this article?')) {
            try {
                await window.electronAPI.deleteItem(id);
                goBack();
            }
            catch (error) {
                console.error('Error deleting article:', error);
            }
        }
    };
    // Toggle settings panel
    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };
    if (loading) {
        return (react_1.default.createElement("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' } },
            react_1.default.createElement("p", null, "Loading content...")));
    }
    if (error || !content) {
        return (react_1.default.createElement("div", { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' } },
            react_1.default.createElement("p", null, error || 'Content not found'),
            react_1.default.createElement("button", { onClick: goBack, style: { marginTop: '16px' } }, "Go Back")));
    }
    // Apply reader page class
    const readerPageClass = 'reader-page';
    return (react_1.default.createElement("div", { className: readerPageClass, style: { height: '100vh', display: 'flex', flexDirection: 'column' } },
        react_1.default.createElement("header", { className: "reader-header", style: {
                padding: '8px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            } },
            react_1.default.createElement("button", { onClick: goBack, style: { padding: '4px 8px' } }, "\u2190 Back"),
            react_1.default.createElement("div", { style: { display: 'flex', gap: '8px' } },
                react_1.default.createElement("button", { onClick: toggleSettings, style: { padding: '4px 8px' } }, showSettings ? 'Hide Settings' : 'Settings'),
                react_1.default.createElement("button", { onClick: handleDelete, style: {
                        padding: '4px 8px',
                        backgroundColor: 'var(--destructive-bg, rgba(255, 0, 0, 0.1))',
                        color: 'var(--destructive-text, #d32f2f)',
                        border: 'none',
                        borderRadius: '4px',
                    } }, "Delete"))),
        react_1.default.createElement("div", { className: "reader-body", style: {
                display: 'flex',
                flexGrow: 1,
                position: 'relative',
                overflow: 'hidden',
            } },
            react_1.default.createElement("div", { className: "reader-content", style: {
                    flexGrow: 1,
                    overflow: 'auto',
                } },
                react_1.default.createElement(common_ui_1.ContentViewer, { title: content.title, content: content.content, author: content.author, publishDate: content.publishDate, settings: readingSettings })),
            showSettings && (react_1.default.createElement("div", { className: "settings-sidebar", style: {
                    overflow: 'auto',
                } },
                react_1.default.createElement(common_ui_1.ReadingSettingsPanel, { settings: readingSettings, onSettingsChange: handleSettingsChange }))))));
};
exports.ReaderPage = ReaderPage;
//# sourceMappingURL=ReaderPage.js.map