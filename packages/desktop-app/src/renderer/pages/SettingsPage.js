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
exports.SettingsPage = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const ThemeProvider_1 = require("../providers/ThemeProvider");
const common_ui_1 = require("@mosaiq/common-ui");
require("../styles/settings.css");
const SettingsPage = ({ platformCapabilities }) => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { setTheme } = (0, ThemeProvider_1.useTheme)();
    const [readingSettings, setReadingSettings] = (0, react_1.useState)({
        fontSize: '18px',
        lineHeight: '1.6',
        theme: 'light',
        width: '800px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    });
    const [generalSettings, setGeneralSettings] = (0, react_1.useState)({
        defaultView: 'list',
        enableAI: false,
        syncEnabled: false
    });
    // Load settings on component mount
    (0, react_1.useEffect)(() => {
        const loadSettings = async () => {
            try {
                // Load reading settings
                const settings = await window.electronAPI.getReadingSettings();
                setReadingSettings(settings);
                // Load general settings
                const appSettings = await window.electronAPI.getAllSettings();
                if (appSettings && appSettings.general) {
                    setGeneralSettings(appSettings.general);
                }
            }
            catch (error) {
                console.error('Error loading settings:', error);
            }
        };
        loadSettings();
    }, []);
    // Handle reading settings changes
    const handleReadingSettingsChange = async (settings) => {
        try {
            const updatedSettings = await window.electronAPI.updateReadingSettings(settings);
            setReadingSettings(updatedSettings);
            // Update global theme if theme setting changed
            if (settings.theme) {
                setTheme(settings.theme);
            }
        }
        catch (error) {
            console.error('Error updating reading settings:', error);
        }
    };
    // Handle view type change
    const handleDefaultViewChange = async (viewType) => {
        try {
            const updatedSettings = await window.electronAPI.updateGeneralSettings({
                ...generalSettings,
                defaultView: viewType
            });
            setGeneralSettings(updatedSettings);
        }
        catch (error) {
            console.error('Error updating general settings:', error);
        }
    };
    // Handle AI toggle
    const handleAIToggle = async () => {
        try {
            const updatedSettings = await window.electronAPI.updateGeneralSettings({
                ...generalSettings,
                enableAI: !generalSettings.enableAI
            });
            setGeneralSettings(updatedSettings);
        }
        catch (error) {
            console.error('Error updating AI settings:', error);
        }
    };
    // Handle sync toggle
    const handleSyncToggle = async () => {
        try {
            const updatedSettings = await window.electronAPI.updateGeneralSettings({
                ...generalSettings,
                syncEnabled: !generalSettings.syncEnabled
            });
            setGeneralSettings(updatedSettings);
        }
        catch (error) {
            console.error('Error updating sync settings:', error);
        }
    };
    // Reset all settings
    const handleResetSettings = async () => {
        if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
            try {
                const defaultSettings = await window.electronAPI.resetSettings();
                setReadingSettings(defaultSettings.reading);
                setGeneralSettings(defaultSettings.general);
            }
            catch (error) {
                console.error('Error resetting settings:', error);
            }
        }
    };
    // Go back to home page
    const goBack = () => {
        navigate('/');
    };
    // Set class for settings page
    const settingsPageClass = 'settings-page';
    return (react_1.default.createElement("div", { className: settingsPageClass, style: { padding: '20px', maxWidth: '800px', margin: '0 auto' } },
        react_1.default.createElement("header", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' } },
            react_1.default.createElement("h1", null, "Settings"),
            react_1.default.createElement("button", { onClick: goBack, className: "primary-action", style: { padding: '8px 16px' } }, "\u2190 Back")),
        react_1.default.createElement("div", { className: "settings-sections", style: { display: 'grid', gridTemplateColumns: '1fr', gap: '32px' } },
            react_1.default.createElement("section", { className: "settings-section" },
                react_1.default.createElement("h2", null, "Reading Settings"),
                react_1.default.createElement(common_ui_1.ReadingSettingsPanel, { settings: readingSettings, onSettingsChange: handleReadingSettingsChange })),
            react_1.default.createElement("section", { className: "settings-section" },
                react_1.default.createElement("h2", null, "General Settings"),
                react_1.default.createElement("div", { style: { marginBottom: '16px' } },
                    react_1.default.createElement("label", { style: { display: 'block', marginBottom: '8px' } }, "Theme"),
                    react_1.default.createElement("div", { className: "view-selector", style: { display: 'flex', gap: '8px' } },
                        react_1.default.createElement("button", { onClick: () => handleReadingSettingsChange({ theme: 'light' }), className: readingSettings.theme === 'light' ? 'active' : '', style: { flex: 1, padding: '8px', borderRadius: '4px', cursor: 'pointer' } }, "Light"),
                        react_1.default.createElement("button", { onClick: () => handleReadingSettingsChange({ theme: 'sepia' }), className: readingSettings.theme === 'sepia' ? 'active' : '', style: { flex: 1, padding: '8px', borderRadius: '4px', cursor: 'pointer' } }, "Sepia"),
                        react_1.default.createElement("button", { onClick: () => handleReadingSettingsChange({ theme: 'dark' }), className: readingSettings.theme === 'dark' ? 'active' : '', style: { flex: 1, padding: '8px', borderRadius: '4px', cursor: 'pointer' } }, "Dark"))),
                react_1.default.createElement("div", { style: { marginBottom: '16px' } },
                    react_1.default.createElement("label", { style: { display: 'block', marginBottom: '8px' } }, "Default View"),
                    react_1.default.createElement("div", { className: "view-selector", style: { display: 'flex', gap: '8px' } },
                        react_1.default.createElement("button", { onClick: () => handleDefaultViewChange('list'), className: generalSettings.defaultView === 'list' ? 'active' : '', style: { flex: 1, padding: '8px', borderRadius: '4px', cursor: 'pointer' } }, "List"),
                        react_1.default.createElement("button", { onClick: () => handleDefaultViewChange('grid'), className: generalSettings.defaultView === 'grid' ? 'active' : '', style: { flex: 1, padding: '8px', borderRadius: '4px', cursor: 'pointer' } }, "Grid"),
                        react_1.default.createElement("button", { onClick: () => handleDefaultViewChange('graph'), className: generalSettings.defaultView === 'graph' ? 'active' : '', style: { flex: 1, padding: '8px', borderRadius: '4px', cursor: 'pointer' } }, "Graph"))),
                react_1.default.createElement("div", { style: { marginBottom: '16px' } },
                    react_1.default.createElement("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
                        react_1.default.createElement("input", { type: "checkbox", checked: generalSettings.enableAI, onChange: handleAIToggle, style: { width: '18px', height: '18px' } }),
                        react_1.default.createElement("span", null, "Enable AI features"),
                        platformCapabilities && !platformCapabilities.hasLocalAIProcessing && (react_1.default.createElement("span", { style: { fontSize: '14px', color: 'var(--muted-text)' } }, "(Requires cloud processing)")))),
                react_1.default.createElement("div", { style: { marginBottom: '16px' } },
                    react_1.default.createElement("label", { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
                        react_1.default.createElement("input", { type: "checkbox", checked: generalSettings.syncEnabled, onChange: handleSyncToggle, style: { width: '18px', height: '18px' } }),
                        react_1.default.createElement("span", null, "Enable sync across devices"),
                        react_1.default.createElement("span", { style: { fontSize: '14px', color: 'var(--muted-text)' } }, "(Coming soon)")))),
            platformCapabilities && (react_1.default.createElement("section", { className: "settings-section" },
                react_1.default.createElement("h2", null, "System Information"),
                react_1.default.createElement("div", { className: "system-info", style: {
                        padding: '12px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        lineHeight: '1.5'
                    } },
                    react_1.default.createElement("p", null,
                        react_1.default.createElement("strong", null, "Platform:"),
                        " ",
                        platformCapabilities.type),
                    react_1.default.createElement("p", null,
                        react_1.default.createElement("strong", null, "File System Access:"),
                        " ",
                        platformCapabilities.hasFileSystemAccess ? 'Yes' : 'No'),
                    react_1.default.createElement("p", null,
                        react_1.default.createElement("strong", null, "Local AI Processing:"),
                        " ",
                        platformCapabilities.hasLocalAIProcessing ? 'Yes' : 'No'),
                    react_1.default.createElement("p", null,
                        react_1.default.createElement("strong", null, "Native Notifications:"),
                        " ",
                        platformCapabilities.hasNativeNotifications ? 'Yes' : 'No')))),
            react_1.default.createElement("section", { className: "settings-section" },
                react_1.default.createElement("h2", null, "Reset"),
                react_1.default.createElement("button", { onClick: handleResetSettings, className: "reset-button primary-action", style: {
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    } }, "Reset All Settings to Defaults")))));
};
exports.SettingsPage = SettingsPage;
//# sourceMappingURL=SettingsPage.js.map