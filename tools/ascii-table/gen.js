document.body.innerText = "";


function ch(y) {
	return y >= 33 && y <= 126 ? String.fromCharCode(y) : "?";
}

function three(y) {
	return y.toString(16).toUpperCase().padStart(2, "0") + ` (${y.toString(2).padStart(8, "0")})`;
}


let s = "";
for(let y=0; y<32; y++) {

s+=`<tr>
    <td class="dec">${y}</td><td class="chr">${ch(y)}</td><td>${three(y)}</td><td>TODO</td><th class="sep">|</th>
    <td class="dec">${y+32}</td><td class="chr">${ch(y+32)}</td><td>${three(y+32)}</td><th class="sep">|</th>
    <td class="dec">${y+64}</td><td class="chr">${ch(y+64)}</td><td>${three(y+64)}</td><th class="sep">|</th>
    <td class="dec">${y+32+64}</td><td class="chr">${ch(y+32+64)}</td><td>${three(y+32+64)}</td>
</tr>\n`;
}
document.body.style = "font-family: monospace; white-space: pre-wrap";
document.body.innerText = s;