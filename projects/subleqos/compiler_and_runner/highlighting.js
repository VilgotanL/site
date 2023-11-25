codeArea.highlightCallback = function(code, { color, background }) {
    const keywords = ["int", "void", "inline", "static", "dynamic"];
    const identifierChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789";
    const commentColor = "#009900";
    const keywordColor = "blue";
    const identifierColor = "black";
    const numberColor = "dodgerblue";
    const stringColor = "darkgreen";
    const operatorColor = "#555555";

    for(let i=0; i<code.length;) {
        if([" ", "\t", "\n", "\r"].includes(code[i])) {
            i++;
            continue;
        } else if(code.slice(i).startsWith("//")) {
            let start = i;
            while(i < code.length && code[i] !== "\n") i++;
            color(start, i, commentColor);
        } else if(code.slice(i).startsWith("/*")) {
            let start = i;
            let depth = 0;
            while(i < code.length) {
                if(code.slice(i).startsWith("/*")) {
                    depth++;
                    i += 2;
                } else if(code.slice(i).startsWith("*/")) {
                    depth--;
                    i += 2;
                    if(depth === 0) break;
                } else i++;
            }
            color(start, i, commentColor);
        } else if(identifierChars.includes(code[i])) {
            let start = i;
            while(i < code.length && identifierChars.includes(code[i])) i++;
            let identifier = code.slice(start, i);
            color(start, i, "0123456789".includes(code[start]) ? numberColor : (keywords.includes(identifier) ? keywordColor : identifierColor));
        } else if(code[i] === '"' || code[i] === "'") {
            let start = i;
            while(i < code.length && code[i] !== "\n") {
                i++;
                if(i < code.length && code[i] === "\\") {
                    i++;
                } else if(i < code.length && code[i] === code[start]) {
                    i++;
                    break;
                }
            }
            color(start, i, stringColor);
        } else {
            color(i, i+1, operatorColor);
            i++;
        }
    }
};
codeArea.rehighlight();