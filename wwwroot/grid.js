"use strict";

const titleInput = document.querySelector("#title");
const swatch = document.querySelector("#swatch");
const swatch2 = document.querySelector("#swatch2");
const swatch3 = document.querySelector("#swatch3");
const rotateButton = document.querySelector("#rotate");
const printButton = document.querySelector("#print");

swatch.value = getCookie("swatch1");
swatch2.value = getCookie("swatch2");

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
        beads: []
    };
    for (let i = 0; i < MAX_ROWS; i++) {
        for (let j = 0; j < MAX_COLUMNS; j++) {
            const idx = (i * MAX_COLUMNS) + j;
            data.beads.push(dict[idx]);
        }
    }

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

const onMoveDown = $evt => {
    // Get all divs in this row, replace the row below with matching color.
    const row = +$evt.target.dataset.row;
    let target_row = row + 1;
    if (target_row > MAX_ROWS - 1) target_row = 0;

    const src = document.querySelectorAll("div.bead[data-row='" + row + "']", table);
    const dst = document.querySelectorAll("div.bead[data-row='" + target_row + "']", table);

    const dict = {};
    src.forEach(s => dict[s.dataset.col] = s.style.color);
    dst.forEach(d => d.style.color = dict[d.dataset.col]);
};

const onMoveUp = $evt => {
    // Get all divs in this row, replace the row below with matching color.
    const row = +$evt.target.dataset.row;
    let target_row = row - 1;
    if (target_row < 0) target_row = MAX_ROWS - 1;

    const src = document.querySelectorAll("div.bead[data-row='" + row + "']", table);
    const dst = document.querySelectorAll("div.bead[data-row='" + target_row + "']", table);

    const dict = {};
    src.forEach(s => dict[s.dataset.col] = s.style.color);
    dst.forEach(d => d.style.color = dict[d.dataset.col]);
};

const onMoveRight = $evt => {
    // Get all divs in this column, replace the column to the right with matching color.
    const col = +$evt.target.dataset.col;
    let target_col = col + 1;
    if (target_col > MAX_COLUMNS - 1) target_col = 0;

    const src = document.querySelectorAll("div.bead[data-col='" + col + "']", table);
    const dst = document.querySelectorAll("div.bead[data-col='" + target_col + "']", table);

    const dict = {};
    src.forEach(s => dict[s.dataset.row] = s.style.color);
    dst.forEach(d => d.style.color = dict[d.dataset.row]);
};

const onMoveLeft = $evt => {
    // Get all divs in this column, replace the column to the left with matching color.
    const col = +$evt.target.dataset.col;
    let target_col = col - 1;
    if (target_col < 0) target_col = MAX_COLUMNS - 1;

    const src = document.querySelectorAll("div.bead[data-col='" + col + "']", table);
    const dst = document.querySelectorAll("div.bead[data-col='" + target_col + "']", table);

    const dict = {};
    src.forEach(s => dict[s.dataset.row] = s.style.color);
    dst.forEach(d => d.style.color = dict[d.dataset.row]);
};

let MAX_ROWS = 50;
let MAX_COLUMNS = 40;
const table = document.querySelector("#grid");

const render = () => {
    table.innerHTML = ""; // Clear contents.

    for (let i = 0; i < MAX_ROWS; i++) {
        const tr = document.createElement("tr");
        table.appendChild(tr);

        for (let j = 0; j < MAX_COLUMNS; j++) {
            const td = document.createElement("td");
            tr.appendChild(td);

            const div = document.createElement("div");
            td.appendChild(div);

            div.className = "bead";
            div.dataset.row = i;
            div.dataset.col = j;

            div.addEventListener("click", onBeadClick);
            div.addEventListener("mousemove", onBeadMove);
        }

        {
            // Move up.
            let td = document.createElement("td");
            tr.appendChild(td);

            let div = document.createElement("div");
            td.appendChild(div);

            div.className = "move up";
            div.dataset.row = i;
            div.textContent = "^";

            div.addEventListener("click", onMoveUp);
        }

        {
            // Move down.
            let td = document.createElement("td");
            tr.appendChild(td);

            let div = document.createElement("div");
            td.appendChild(div);

            div.className = "move down";
            div.dataset.row = i;
            div.textContent = "V";

            div.addEventListener("click", onMoveDown);
        }
    }

    {
        const tr = document.createElement("tr");
        table.appendChild(tr);

        for (let j = 0; j < MAX_COLUMNS; j++) {
            const td = document.createElement("td");
            tr.appendChild(td);

            const div = document.createElement("div");
            td.appendChild(div);

            div.className = "move right";
            div.dataset.col = j;
            div.textContent = ">";

            div.addEventListener("click", onMoveRight);
        }
    }

    {
        const tr = document.createElement("tr");
        table.appendChild(tr);

        for (let j = 0; j < MAX_COLUMNS; j++) {
            const td = document.createElement("td");
            tr.appendChild(td);

            const div = document.createElement("div");
            td.appendChild(div);

            div.className = "move left";
            div.dataset.col = j;
            div.textContent = "<";

            div.addEventListener("click", onMoveLeft);
        }
    }
}

render();