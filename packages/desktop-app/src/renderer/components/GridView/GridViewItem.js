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
exports.GridViewItem = void 0;
const react_1 = __importStar(require("react"));
require("./GridViewItem.css");
const GridViewItem = ({ item, onClick, onDelete, formatDate, getSourceIcon }) => {
    const [isHovering, setIsHovering] = (0, react_1.useState)(false);
    const handleMouseEnter = () => {
        setIsHovering(true);
    };
    const handleMouseLeave = () => {
        setIsHovering(false);
    };
    return (react_1.default.createElement("div", { className: "grid-item", onClick: onClick, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave },
        react_1.default.createElement("div", { className: "grid-item-image" },
            item.featuredImage ? (react_1.default.createElement("img", { src: item.featuredImage, alt: item.title, onError: (e) => {
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24"><rect width="100%" height="100%" fill="%232c2c2c"/><text x="50%" y="50%" font-family="Arial" font-size="48" fill="%23999" text-anchor="middle" dominant-baseline="middle">📄</text></svg>';
                } })) : (react_1.default.createElement("div", { className: "default-image" }, getSourceIcon(item))),
            isHovering && (react_1.default.createElement("div", { className: "grid-item-actions" },
                react_1.default.createElement("button", { className: "delete-button", onClick: (e) => {
                        e.stopPropagation();
                        onDelete(e);
                    }, title: "Delete", "aria-label": "Delete item" },
                    react_1.default.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                        react_1.default.createElement("polyline", { points: "3 6 5 6 21 6" }),
                        react_1.default.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
                        react_1.default.createElement("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
                        react_1.default.createElement("line", { x1: "14", y1: "11", x2: "14", y2: "17" })))))),
        react_1.default.createElement("div", { className: "grid-item-content" },
            react_1.default.createElement("h3", { className: "grid-item-title" }, item.title),
            item.excerpt && (react_1.default.createElement("p", { className: "grid-item-excerpt" }, item.excerpt)),
            react_1.default.createElement("div", { className: "grid-item-footer" },
                react_1.default.createElement("div", { className: "grid-item-meta" },
                    item.author && react_1.default.createElement("span", { className: "grid-item-author" }, item.author),
                    react_1.default.createElement("span", { className: "grid-item-date" }, formatDate(item.dateAdded))),
                item.tags && item.tags.length > 0 && (react_1.default.createElement("div", { className: "grid-item-tags" },
                    item.tags.slice(0, 3).map((tag, index) => (react_1.default.createElement("span", { key: index, className: "grid-tag" }, tag))),
                    item.tags.length > 3 && (react_1.default.createElement("span", { className: "grid-tag-more" },
                        "+",
                        item.tags.length - 3))))))));
};
exports.GridViewItem = GridViewItem;
//# sourceMappingURL=GridViewItem.js.map