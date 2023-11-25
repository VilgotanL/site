const codeArea = document.querySelector("code-area");
const consoleArea = document.querySelector("console-area");




document.querySelector("#compile-btn").addEventListener("click", () => {
    consoleArea.reset();
    try {
        console.log(parse(codeArea.value));
    } catch(e) {
        consoleArea.print(e.message);
    }
});