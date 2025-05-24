"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListView = void 0;
const react_1 = __importDefault(require("react"));
const ListViewItem_1 = require("./ListViewItem");
require("./ListView.css");
const ListView = ({ items, onItemClick, onDeleteItem, formatDate, formatTime, getSourceIcon }) => {
    return (react_1.default.createElement("div", { className: "list-view" },
        react_1.default.createElement("div", { className: "list-header" },
            react_1.default.createElement("div", { className: "list-header-item list-header-icon" }),
            react_1.default.createElement("div", { className: "list-header-item list-header-title" }, "Title"),
            react_1.default.createElement("div", { className: "list-header-item list-header-author" }, "Author"),
            react_1.default.createElement("div", { className: "list-header-item list-header-date" }, "Date Added"),
            react_1.default.createElement("div", { className: "list-header-item list-header-time" }, "Time"),
            react_1.default.createElement("div", { className: "list-header-item list-header-actions" })),
        react_1.default.createElement("div", { className: "list-items" }, items.map(item => (react_1.default.createElement(ListViewItem_1.ListViewItem, { key: item.id, item: item, onClick: () => onItemClick(item.id), onDelete: (e) => onDeleteItem(item.id, e), formatDate: formatDate, formatTime: formatTime, getSourceIcon: getSourceIcon }))))));
};
exports.ListView = ListView;
//# sourceMappingURL=ListView.js.map