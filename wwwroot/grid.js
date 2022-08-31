"use strict";

const titleInput = document.querySelector("#title");
const swatch = document.querySelector("#swatch");
const swatch2 = document.querySelector("#swatch2");
const swatch3 = document.querySelector("#swatch3");
const rotateButton = document.querySelector("#rotate");
const printButton = document.querySelector("#print");

swatch.value = getCookie("swatch1");
swatch2.value = getCookie("swatch2");

titleInput.addEventListener("blur", $evt => {
    // Immediately force a save when title is blurred.
    save();
});

swatch.addEventListener("change", $evt => {
    setCookie("swatch1", $evt.target.value, 30);
});

swatch2.addEventListener("change", $evt => {
    setCookie("swatch2", $evt.target.value, 30);
});

swatch3.addEventListener("blur", $evt => {
    if (!window.confirm("Do you want to erase your drawing?")) return;

    const beads = document.querySelectorAll("div.bead", table);
    beads.forEach(b => {
        b.style.color = $evt.target.value;
    });
});

rotateButton.addEventListener("click", $evt => {
    if (!window.confirm("Do you want to erase your drawing?")) return;

    const tmp = MAX_COLUMNS;
    MAX_COLUMNS = MAX_ROWS;
    MAX_ROWS = tmp;

    render();
});

printButton.addEventListener("click", $evt => {
    if ($evt.ctrlKey) {
        randomize();
        return;
    }

    const data = toData();

    const str = JSON.stringify(data);

    const frm = document.createElement('FORM');
    frm.action = "generate";
    frm.method = 'POST';
    let newWindow = true; // This just provides a spot for debugging.
    if (newWindow) frm.target = '_blank';

    const input = document.createElement('INPUT');
    input.name = "data";
    input.value = str;
    frm.appendChild(input);

    const body = document.querySelector('BODY');
    body.appendChild(frm);
    frm.submit();
    body.removeChild(frm);
});

const randomize = () => {
    const beads = document.querySelectorAll("div.bead", table);

    for (let i = 0; i < MAX_COLUMNS; i++) {
        for (let j = 0; j < MAX_ROWS; j++) {
            const idx = (j * MAX_COLUMNS) + i;

            const red = Math.random() * 255;
            const green = Math.random() * 255;
            const blue = Math.random() * 255;

            beads[idx].style.color = 'rgba(' + red + ', ' + green + ', ' + blue + ')';
        }
    }
};

const setBeadColor = (target, ctrlKey, altKey) => {
    if (ctrlKey) {
        // Clear.
        target.style.color = "#FFF";
    } else if (altKey) {
        // Secondary color.
        target.style.color = swatch2.value;
    } else {
        // Primary color.
        target.style.color = swatch.value;
    }
}

const onBeadClick = $evt => {
    setBeadColor($evt.target, $evt.ctrlKey, $evt.altKey);
};

const onBeadMove = $evt => {
    if ($evt.buttons === 1) {
        setBeadColor($evt.target, $evt.ctrlKey, $evt.altKey);

        if ($evt.stopPropagation) $evt.stopPropagation();
        if ($evt.preventDefault) $evt.preventDefault();
        $evt.cancelBubble = true;
        $evt.returnValue = false;
        return false;
    }
};

let MAX_ROWS = 50;
let MAX_COLUMNS = 40;
const table = document.querySelector("#grid");

const render = (beads) => {
    table.innerHTML = ""; // Clear contents.

    for (let i = 0; i < MAX_ROWS; i++) {
        const tr = document.createElement("tr");
        table.appendChild(tr);

        for (let j = 0; j < MAX_COLUMNS; j++) {
            const td = document.createElement("td");
            tr.appendChild(td);

            const div = document.createElement("div");
            td.appendChild(div);

            div.addEventListener("click", onBeadClick);
            div.addEventListener("mousemove", onBeadMove);

            div.className = "bead";
            div.dataset.row = i;
            div.dataset.col = j;

            const idx = (i * MAX_COLUMNS) + j;
            const color = (beads && beads[idx]) || "#FFFFFF";
            div.style.color = color;
        }
    }
};

const toData = () => {

    const rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`

    const beads = document.querySelectorAll("div.bead", table);
    const dict = {};
    beads.forEach(b => {
        const color = b.style.color;
        const row = parseInt(b.dataset.row, 10);
        const col = parseInt(b.dataset.col, 10);
        const idx = (row * MAX_COLUMNS) + col;
        if (color === "") {
            dict[idx] = "#FFFFFF";
        } else {
            dict[idx] = rgba2hex(color);
        }
    });

    const data = {
        title: titleInput.value || null,
        width: MAX_COLUMNS,
        height: MAX_ROWS,
        beads: []
    };

    for (let i = 0; i < MAX_ROWS; i++) {
        for (let j = 0; j < MAX_COLUMNS; j++) {
            const idx = (i * MAX_COLUMNS) + j;
            data.beads.push(dict[idx]);
        }
    }

    return data;
};

const save = () => {
    // Save to local storage.
    const data = toData();

    window.localStorage.setItem("data", JSON.stringify(data));
};

window.setInterval(save, 10 * 1000); // Automatically save every 10 seconds.

(() => {
    // See if there is saved data in local storage.
    const str = window.localStorage.getItem("data");

    if (str) {
        const data = JSON.parse(str);

        titleInput.value = data.title;
        MAX_ROWS = data.height;
        MAX_COLUMNS = data.width;

        render(data.beads);
    } else {
        render();
    }
})();
