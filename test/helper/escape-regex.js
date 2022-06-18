const regexEscapeChars = /[-/\\^$*+?.()|[\]{}]/g;
export default (char) => char.replace(regexEscapeChars, '\\$&');
