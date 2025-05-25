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
exports.ListViewItem = void 0;
const react_1 = __importStar(require("react"));
require("./ListViewItem.css");
const ListViewItem = ({ item, onClick, onDelete, formatDate, formatTime, getSourceIcon }) => {
    const [isHovering, setIsHovering] = (0, react_1.useState)(false);
    const handleMouseEnter = () => {
        setIsHovering(true);
    };
    const handleMouseLeave = () => {
        setIsHovering(false);
    };
    return (react_1.default.createElement("div", { className: "list-item", onClick: onClick, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave },
        react_1.default.createElement("div", { className: "list-item-icon" }, item.featuredImage ? (react_1.default.createElement("img", { src: item.featuredImage, alt: item.title, onError: (e) => {
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="%232c2c2c"/><text x="50%" y="50%" font-family="Arial" font-size="10" fill="%23999" text-anchor="middle" dominant-baseline="middle">📄</text></svg>';
            } })) : (react_1.default.createElement("div", { className: "default-icon" }, getSourceIcon(item)))),
        react_1.default.createElement("div", { className: "list-item-title" },
            react_1.default.createElement("div", { className: "item-title-text" }, item.title),
            item.excerpt && (react_1.default.createElement("div", { className: "item-excerpt" }, item.excerpt)),
            item.tags && item.tags.length > 0 && (react_1.default.createElement("div", { className: "item-tags" }, item.tags.map((tag, index) => (react_1.default.createElement("span", { key: index, className: "item-tag" }, tag)))))),
        react_1.default.createElement("div", { className: "list-item-author" }, item.author || 'Unknown'),
        react_1.default.createElement("div", { className: "list-item-date" }, formatDate(item.dateAdded)),
        react_1.default.createElement("div", { className: "list-item-time" }, formatTime(item.dateAdded)),
        react_1.default.createElement("div", { className: "list-item-actions" }, isHovering && (react_1.default.createElement("button", { className: "delete-button", onClick: (e) => {
                e.stopPropagation();
                onDelete(e);
            }, title: "Delete", "aria-label": "Delete item" },
            react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                react_1.default.createElement("polyline", { points: "3 6 5 6 21 6" }),
                react_1.default.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
                react_1.default.createElement("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
                react_1.default.createElement("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))))));
};
exports.ListViewItem = ListViewItem;
//# sourceMappingURL=ListViewItem.js.map