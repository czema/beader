"use strict";

let data = {
   title: "",
   right_title: "etsy.com/shop/SuperBeadShop",
   width: 40,
   height: 50,
   beads: new Array(50 * 40).fill("#ffffff")
};

const ui = {
   borderActive: 0,
   borderTop: [],
   borderRight: [],
   borderBottom: [],
   borderLeft: [],
   legendActive: null,
   legend: [],
   inRect: (x, y, xRect, yRect, w, h) =>
   (x > xRect && x < xRect + w
      && y > yRect && y < yRect + h),
   inCircle: (x, y, xCircle, yCircle, radius) => ((x - xCircle) * (x - xCircle)
      + (y - yCircle) * (y - yCircle) <= radius * radius),
   inCircleRect: (x, y, xCircle, yCircle, radius) =>
   (x > (xCircle - radius)
      && x < (xCircle + radius)
      && y > (yCircle - radius)
      && y < (yCircle + radius))
};

const beadSize = 16;
const marginSize = 16;

const titleInput = document.querySelector("#title");
const rightTitleInput = document.querySelector("#right_title");
const swatch = document.querySelector("#swatch");
const swatch2 = document.querySelector("#swatch2");
const swatch3 = document.querySelector("#swatch3");
const rotateButton = document.querySelector("#rotate");
const printButton = document.querySelector("#print");
const saveButton = document.querySelector("#save");
const loadButton = document.querySelector("#load");

swatch.value = getCookie("swatch1");
swatch2.value = getCookie("swatch2");

titleInput.addEventListener("blur", () => {
   data.title = $evt.target.value;

   // Immediately force a save when title is blurred.
   save();
});

rightTitleInput.addEventListener("blur", $evt => {
   data.right_title = $evt.target.value;
});

swatch.addEventListener("change", $evt => {
   setCookie("swatch1", $evt.target.value, 30);
});

swatch2.addEventListener("change", $evt => {
   setCookie("swatch2", $evt.target.value, 30);
});

swatch3.addEventListener("blur", $evt => {
   if (!window.confirm("Do you want to erase your drawing?")) return;

   data.beads.fill($evt.target.value);
});

rotateButton.addEventListener("click", () => {
   if (!window.confirm("Do you want to rotate the canvas?  This will erase the portion that doesn't fit.")) return;

   const beads = [];
   for (let j = 0; j < data.width; j++) {
      for (let i = 0; i < data.height; i++) {
         if (j >= data.height) {
            beads.push("#ffffff");
         } else {
            if (i >= data.width) {
               beads.push("#ffffff");
            } else {
               const idx = (j * data.width) + i;
               const cell = data.beads[idx];
               beads.push(cell);
            }
         }
      }
   }

   [data.width, data.height] = [data.height, data.width];
   data.beads = beads;
});

printButton.addEventListener("click", () => {
   const str = JSON.stringify(data);

   const frm = document.createElement('FORM');
   frm.action = "generate";
   frm.method = 'POST';
   frm.target = '_blank';

   const input = document.createElement('INPUT');
   input.name = "data";
   input.value = str;
   frm.appendChild(input);

   const body = document.querySelector('BODY');
   body.appendChild(frm);
   frm.submit();
   body.removeChild(frm);
});

saveButton.addEventListener("click", () => {
   var str = JSON.stringify(data, null, '   ');
   var blob = new Blob([str], { type: 'application/json;charset=utf-8' });
   var url = window.URL.createObjectURL(blob);

   var a = document.createElement('a');
   document.body.appendChild(a);
   a.style = 'display:none;';
   a.href = url;
   a.download = data.title;
   a.click();

   window.URL.revokeObjectURL(url);
   document.body.removeChild(a);
});

loadButton.addEventListener("click", () => {
   // Create a input[type=file], attach an onchange event, and then click it.
   var a = document.createElement('input');
   document.body.appendChild(a);
   a.style = "visibility:hidden;width:0px;position:absolute;top:0";
   a.type = 'file';
   a.onchange = function (a) {
      var b = a.currentTarget;
      b.parentNode.removeChild(b);

      var reader = new FileReader();
      reader.onload = function (c) {
         var text = reader.result;
         var obj = JSON.parse(text, function (key, value) {
            let a;
            if (typeof value === 'string') {
               // Detect if this is an ISO date and if so convert it to an actual date.
               a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
               if (a) {
                  return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
               }
            }
            return value;
         });

         data = obj;

         titleInput.value = data.title;
         rightTitleInput.value = data.right_title;
      };
      reader.readAsText(b.files[0]);
   };
   a.click();
});

const canvas = document.querySelector('canvas');
const canvasLeft = canvas.offsetLeft + canvas.clientLeft;
const canvasTop = canvas.offsetTop + canvas.clientTop;
let mouseActive = false;

const ctx = canvas.getContext('2d');
ctx.translate(0.5, 0.5);

const render = () => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   // Movement borders.
   const gridWidth = beadSize * data.width;
   const gridHeight = (beadSize * data.height) + 2;

   ui.borderTop = [marginSize, 0, gridWidth, marginSize];
   ui.borderRight = [gridWidth + marginSize, marginSize, marginSize, gridHeight];
   ui.borderBottom = [marginSize, gridHeight + marginSize, gridWidth, marginSize];
   ui.borderLeft = [0, marginSize, marginSize, gridHeight];

   ctx.fillStyle = ui.borderActive === 1 ? "#aaa" : "#ccc";
   ctx.fillRect(...ui.borderTop); // Top
   ctx.fillStyle = ui.borderActive === 2 ? "#aaa" : "#ccc";
   ctx.fillRect(...ui.borderRight); // Right
   ctx.fillStyle = ui.borderActive === 3 ? "#aaa" : "#ccc";
   ctx.fillRect(...ui.borderBottom); // Bottom
   ctx.fillStyle = ui.borderActive === 4 ? "#aaa" : "#ccc";
   ctx.fillRect(...ui.borderLeft); // Left

   // Beads.
   ctx.globalAlpha = 1;
   for (let j = 0; j < data.height; j++) {
      for (let i = 0; i < data.width; i++) {
         const idx = (j * data.width) + i;
         const cell = data.beads[idx];

         if (ui.legendActive) {
            ctx.globalAlpha = 0.1;
         }
         if (ui.legendActive === cell) {
            ctx.globalAlpha = 1;
         }

         const x = (i * beadSize) + (beadSize / 2) + marginSize;
         const y = (j * beadSize) + (beadSize / 2) + 1 + marginSize;

         ctx.beginPath();
         ctx.arc(x, y, beadSize / 2, 0, Math.PI * 2);
         ctx.fillStyle = cell;
         ctx.fill();
         ctx.closePath();

         if (cell === "#ffffff" || (ui.legendActive && ui.legendActive === cell)) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 0.5;

            ctx.stroke();
         }
      }
   }
   ctx.globalAlpha = 1;

   // Stats
   // 1 - Gather all colors, count beads.
   const dict = {};
   data.beads.forEach(color => {
      if (color === "#ffffff") return;

      if (dict[color]) {
         dict[color]++;
      } else {
         dict[color] = 1;
      }
   });

   // 2 - Sort by count.
   let ordered = [];
   Object.getOwnPropertyNames(dict).forEach(color => {
      ordered.push({ color: color, count: dict[color] });
   });

   // Only keep the first 20.
   ordered = ordered.sort((a, b) => b.count - a.count).slice(0, 25);

   // 3 - Draw.
   ui.legend = [];
   ordered.forEach((obj, idx) => {
      let x = 0, y = 0;

      if (data.width > data.height) {
         x = (idx * beadSize * 2) + (beadSize) + marginSize;
         y = gridHeight + (marginSize * 2) + (beadSize) + 4;
      } else {
         x = gridWidth + (marginSize * 2) + (beadSize) + 6;
         y = (idx * beadSize * 2) + (beadSize) + marginSize;
      }

      ui.legend.push([x, y, beadSize, obj.color]);

      ctx.beginPath();
      ctx.arc(x, y, beadSize, 0, Math.PI * 2);
      ctx.fillStyle = obj.color;
      ctx.fill();

      // Draw the number of beads inside the circle.
      ctx.font = "12px sans-serif";
      const tm = ctx.measureText(obj.count);
      const tw = tm.width;
      const th = tm.actualBoundingBoxAscent + tm.actualBoundingBoxDescent;
      ctx.fillStyle = '#000000';
      ctx.shadowColor = '#000000AA';
      ctx.shadowBlur = 3;
      ctx.strokeText(obj.count, x - (tw / 2), y + (th / 2));
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText(obj.count, x - (tw / 2), y + (th / 2));

      if (obj.color === ui.legendActive) {
         ctx.stroke();
      }
   });

   requestAnimationFrame(render);
}

// When the border is clicked.
const clickBorder = () => {
   switch (ui.borderActive) {
      case 1:
         for (let i = 0; i < data.width; i++) {
            data.beads.shift();
            data.beads.push('#ffffff');
         }
         break;
      case 2:
         for (let i = 0; i < data.height; i++) {
            const idx = (i * data.width);
            data.beads.splice(idx, 0, '#ffffff');
            data.beads.splice(idx + data.width, 1);
         }
         break;
      case 3:
         for (let i = 0; i < data.width; i++) {
            data.beads.unshift('#ffffff');
            data.beads.pop();
         }
         break;
      case 4:
         for (let i = 0; i < data.height; i++) {
            const idx = (i * data.width);
            data.beads.splice(idx + data.width, 0, '#ffffff');
            data.beads.splice(idx, 1);
         }
         break;
   }
}

// When a legend color is clicked.
const clickLegend = event => {
   if (ui.legendActive) {
      if (event.shiftKey) {
         const input = document.createElement('INPUT');
         input.type = 'color';
         input.value = ui.legendActive;
         input.style.display = 'none';

         const body = document.querySelector('BODY');
         body.appendChild(input);

         input.focus();
         input.click();

         const oldColor = ui.legendActive;
         input.addEventListener("change", $evt => {
            // Update all existing colors to the new color.
            data.beads.forEach((b, idx) => {
               if (b === oldColor) {
                  data.beads[idx] = $evt.target.value;
               }
            });

            body.removeChild(input);
         });
      } else if (event.altKey) {
         swatch2.value = ui.legendActive;
      } else {
         swatch.value = ui.legendActive;
      }
   }
}

// When a bead is clicked.  Note that beads are automatically clicked on mouse move.
const clickBead = event => {
   const x = event.pageX - canvasLeft - marginSize;
   const y = event.pageY - canvasTop - marginSize;

   if (x < 0 || y < 0) return;
   if (x > (data.width * 16) - 1) return;
   if (y > (data.height * 16) - 1) return;

   // Given the geometry of the beads, determine which one was clicked.
   const cX = Math.round((x - 8) / 16);
   const cY = Math.round((y - 9) / 16);
   const idx = (cY * data.width) + cX;

   let color = '#ffffff';
   if (event.ctrlKey) {
      // Clear.
   } else if (event.altKey) {
      // Secondary color.
      color = swatch2.value;
   } else {
      // Primary color.
      color = swatch.value;
   }

   data.beads[idx] = color;
}

// Determine what UI element the mouse is over.
const hitDetection = event => {
   // Determine where the mouse is, relative to the canvas.
   const x = event.pageX - canvasLeft;
   const y = event.pageY - canvasTop;

   // Is it over the borders?
   ui.borderActive = 0;
   if (ui.inRect(x, y, ...ui.borderTop)) {
      ui.borderActive = 1;
   } else if (ui.inRect(x, y, ...ui.borderRight)) {
      ui.borderActive = 2;
   } else if (ui.inRect(x, y, ...ui.borderBottom)) {
      ui.borderActive = 3;
   } else if (ui.inRect(x, y, ...ui.borderLeft)) {
      ui.borderActive = 4;
   }

   // Is it over a key color?
   ui.legendActive = "";
   ui.legend.forEach(l => {
      if (ui.inCircleRect(x, y, l[0], l[1], l[2] + 0.5)) {
         ui.legendActive = l[3]; // Store the color.
      }
   });

   if (!mouseActive) return;
   if (!event.buttons) {
      mouseActive = false;
      return false; // No longer being held down.
   }

   return true;
};

// Set the canvas size to match its parent size when the window is resized.
const resize = () => {
   canvas.width = canvas.parentElement.clientWidth;
   canvas.height = canvas.parentElement.clientHeight;
};

const mouseDown = event => {
   mouseActive = true;
   if (hitDetection(event)) {
      clickBorder(event);
      clickLegend(event);
      clickBead(event);
   }
};

const mouseUp = () => mouseActive = false;

const mouseMove = event => {
   if (hitDetection(event)) {
      clickBead(event);
   }
};

window.addEventListener('resize', resize);
window.addEventListener('mousedown', mouseDown);
window.addEventListener('touchstart', mouseDown);
window.addEventListener('mouseup', mouseUp);
window.addEventListener('touchend', mouseUp);
canvas.addEventListener('mousemove', mouseMove);
canvas.addEventListener('touchmove', mouseMove);

// Serialize the data and store in local storage.
const autoSave = () => {
   data.title = titleInput.value || null;
   data.right_title = rightTitleInput.value || null;

   // Save to local storage.
   window.localStorage.setItem("data", JSON.stringify(data));
};

// Init.
(() => {
   // See if there is saved data in local storage.
   const str = window.localStorage.getItem("data");

   if (str) {
      data = JSON.parse(str);

      titleInput.value = data.title || "";
      rightTitleInput.value = data.right_title || "";
   }

   // Begin.
   resize();
   requestAnimationFrame(render);
   window.setInterval(autoSave, 10 * 1000); // Automatically save every 10 seconds.
})();