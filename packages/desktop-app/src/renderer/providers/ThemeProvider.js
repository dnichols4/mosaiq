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
exports.useTheme = exports.ThemeProvider = void 0;
const react_1 = __importStar(require("react"));
const ThemeContext = (0, react_1.createContext)(undefined);
const ThemeProvider = ({ children, initialTheme = null }) => {
    const [theme, setThemeState] = (0, react_1.useState)(initialTheme || 'light');
    const [isInitialized, setIsInitialized] = (0, react_1.useState)(!!initialTheme);
    // Load theme settings from storage on mount if no initialTheme provided
    (0, react_1.useEffect)(() => {
        // Skip loading if initialTheme was provided
        if (initialTheme)
            return;
        const loadTheme = async () => {
            try {
                const settings = await window.electronAPI.getReadingSettings();
                if (settings && settings.theme) {
                    setThemeState(settings.theme);
                }
                setIsInitialized(true);
            }
            catch (error) {
                console.error('Error loading theme settings:', error);
                setIsInitialized(true);
            }
        };
        loadTheme();
    }, [initialTheme]);
    // Apply theme to document body
    (0, react_1.useEffect)(() => {
        if (!isInitialized)
            return;
        // Remove existing theme classes
        document.documentElement.classList.remove('light-theme', 'dark-theme', 'sepia-theme');
        // Add theme class to body
        document.documentElement.classList.add(`${theme}-theme`);
        // Store theme in localStorage for fast loading next time
        try {
            localStorage.setItem('mosaiq-theme', theme);
        }
        catch (error) {
            console.error('Error saving theme to localStorage:', error);
        }
    }, [theme, isInitialized]);
    // Update theme in settings and state
    const setTheme = async (newTheme) => {
        try {
            await window.electronAPI.updateReadingSettings({ theme: newTheme });
            setThemeState(newTheme);
        }
        catch (error) {
            console.error('Error updating theme settings:', error);
        }
    };
    return (react_1.default.createElement(ThemeContext.Provider, { value: { theme, setTheme } }, children));
};
exports.ThemeProvider = ThemeProvider;
// Hook for consuming theme context
const useTheme = () => {
    const context = (0, react_1.useContext)(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
exports.useTheme = useTheme;
//# sourceMappingURL=ThemeProvider.js.map