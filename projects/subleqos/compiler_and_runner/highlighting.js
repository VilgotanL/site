codeArea.highlightCallback = function(code, { color, background }) {
    const keywords = [];
    keywords.push("int", "char", "string", "void", "bool", "const", "mallocated");
    keywords.push("inline", "dynamic", "static");
    keywords.push("while", "for", "break", "continue", "return", "if", "else", "true_io_putch", "jmp", "asm");
    keywords.push("len", "true_io_getch", "true_malloc", "true_free", "program_start_addr", "program_end_addr", "dynf_ptr", "NULL", "static_ints");
    const identifierChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789";
    const commentColor = "#009900";
    const keywordColor = "blue";
    const identifierColor = "black";
    const numberColor = "darkgreen";
    const stringColor = "green";
    const charColor = "#006600";
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
            color(start, i, code[start] === '"' ? stringColor : charColor);
        } else {
            color(i, i+1, operatorColor);
            i++;
        }
    }
};
codeArea.rehighlight();