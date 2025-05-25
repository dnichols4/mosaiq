"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridView = void 0;
const react_1 = __importDefault(require("react"));
const GridViewItem_1 = require("./GridViewItem");
require("./GridView.css");
const GridView = ({ items, onItemClick, onDeleteItem, formatDate, getSourceIcon }) => {
    return (react_1.default.createElement("div", { className: "grid-view" }, items.map(item => (react_1.default.createElement(GridViewItem_1.GridViewItem, { key: item.id, item: item, onClick: () => onItemClick(item.id), onDelete: (e) => onDeleteItem(item.id, e), formatDate: formatDate, getSourceIcon: getSourceIcon })))));
};
exports.GridView = GridView;
//# sourceMappingURL=GridView.js.map