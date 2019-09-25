"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineProperty = (target, k, v, readonly = true) => Object
    .defineProperty(target, k, { value: v, writable: !readonly });
exports.findLast = (array, fn) => {
    for (let idx = array.length - 1; idx >= 0; idx -= 1) {
        const item = array[idx];
        if (fn(item)) {
            return item;
        }
    }
    return undefined;
};
exports.parseWildcard = (input) => {
    let regex = '';
    let escaped = false;
    for (let idx = 0; idx < input.length; idx += 1) {
        const char = input[idx];
        if (!escaped && char === '*') {
            regex += '.*';
        }
        else if (!escaped && char === '?') {
            regex += '.';
        }
        else if (['|', '\\', '{', '}', '(', ')', '[', ']', '^', '$', '+', '*', '?', '.'].includes(char)) {
            regex += `\\${char}`;
        }
        else {
            regex += char;
        }
        escaped = char === '\\' ? !escaped : false;
    }
    return new RegExp(`^${regex}$`);
};
