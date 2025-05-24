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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const HomePage_1 = require("./pages/HomePage");
const ReaderPage_1 = require("./pages/ReaderPage");
const SettingsPage_1 = require("./pages/SettingsPage");
const common_ui_1 = require("@mosaiq/common-ui");
const ThemeProvider_1 = require("./providers/ThemeProvider");
const ElectronDialogService_1 = require("./services/ElectronDialogService");
const ElectronFilePickerService_1 = require("./services/ElectronFilePickerService");
const ClassificationDebugger_1 = __importDefault(require("./components/ClassificationDebugger"));
require("./styles/main.css");
const App = () => {
    const [platformCapabilities, setPlatformCapabilities] = (0, react_1.useState)(null);
    const [initialTheme, setInitialTheme] = (0, react_1.useState)(null);
    // Create instances of the platform-specific services
    const dialogService = new ElectronDialogService_1.ElectronDialogService();
    const filePickerService = new ElectronFilePickerService_1.ElectronFilePickerService();
    (0, react_1.useEffect)(() => {
        // Get platform capabilities and theme settings
        const fetchInitialData = async () => {
            try {
                // Load platform capabilities
                const capabilities = await window.electronAPI.getPlatformCapabilities();
                setPlatformCapabilities(capabilities);
                // Load theme settings
                const settings = await window.electronAPI.getReadingSettings();
                if (settings && settings.theme) {
                    setInitialTheme(settings.theme);
                }
            }
            catch (error) {
                console.error('Error fetching initial data:', error);
            }
        };
        fetchInitialData();
    }, []);
    return (react_1.default.createElement(ThemeProvider_1.ThemeProvider, { initialTheme: initialTheme },
        react_1.default.createElement(common_ui_1.DialogProvider, { service: dialogService },
            react_1.default.createElement(common_ui_1.FilePickerProvider, { service: filePickerService },
                react_1.default.createElement(react_router_dom_1.HashRouter, null,
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("nav", { className: "app-nav" },
                            react_1.default.createElement("ul", null,
                                react_1.default.createElement("li", null,
                                    react_1.default.createElement(react_router_dom_1.Link, { to: "/" }, "Home")),
                                react_1.default.createElement("li", null,
                                    react_1.default.createElement(react_router_dom_1.Link, { to: "/settings" }, "Settings")),
                                react_1.default.createElement("li", null,
                                    react_1.default.createElement(react_router_dom_1.Link, { to: "/debug/classification" }, "Classification Debugger")))),
                        react_1.default.createElement(react_router_dom_1.Routes, null,
                            react_1.default.createElement(react_router_dom_1.Route, { path: "/", element: react_1.default.createElement(HomePage_1.HomePage, { platformCapabilities: platformCapabilities }) }),
                            react_1.default.createElement(react_router_dom_1.Route, { path: "/reader/:id", element: react_1.default.createElement(ReaderPage_1.ReaderPage, null) }),
                            react_1.default.createElement(react_router_dom_1.Route, { path: "/settings", element: react_1.default.createElement(SettingsPage_1.SettingsPage, { platformCapabilities: platformCapabilities }) }),
                            react_1.default.createElement(react_router_dom_1.Route, { path: "/debug/classification", element: react_1.default.createElement(ClassificationDebugger_1.default, null) })))))),
        react_1.default.createElement("style", null, `
        .app-nav {
          background-color: #f5f5f5;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .app-nav ul {
          list-style-type: none;
          margin: 0;
          padding: 0;
          display: flex;
        }
        .app-nav li {
          margin-right: 20px;
        }
        .app-nav a {
          text-decoration: none;
          color: #333;
          font-weight: bold;
        }
        .app-nav a:hover {
          color: #007bff;
        }
        `)));
};
exports.App = App;
//# sourceMappingURL=App.js.map