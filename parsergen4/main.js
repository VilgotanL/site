const inpArea = document.querySelector("#inp");
const outArea = document.querySelector("#out");
const outP = document.querySelector("#out-p");


if(sessionStorage.getItem("grammarCode") !== null) inpArea.value = sessionStorage.getItem("grammarCode");

// TODO add base64 url hash?



function update() {
    sessionStorage.setItem("grammarCode", inpArea.value);
    try {
        const grammar = parse(inpArea.value, { filename: "grammar" });
        outArea.style.color = "black";
        outArea.value = grammar.emitted;
        outP.style.color = "black";
        outP.innerText = "Output";
    } catch(e) {
        outArea.style.color = "#aa0000";
        outP.style.color = "#ee0000";
        outP.innerText = e.message;
    }
}


inpArea.addEventListener("input", update);
update();