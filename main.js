const findElementRetry = (func) => {
  return new Promise((resolve, reject) => {
    let retryCounter = 0;
    const retry = () => {
      try {
        let element = func();
        if (!element) throw new Error("not found");
        resolve(element);
      } catch (err) {
        retryCounter++;

        if (retryCounter > 99999) {
          reject("not found");
          return;
        }
        setTimeout(retry, 1000);
      }
    };
    retry();
  });
};

const findCanvas = () =>
  findElementRetry(() =>
    document
      .querySelector("mona-lisa-embed")
      .shadowRoot.querySelector("mona-lisa-canvas")
      .shadowRoot.querySelector("canvas")
  );
const findToolbar = () =>
  findElementRetry(() =>
    document
      .querySelector("mona-lisa-embed")
      .shadowRoot.querySelector("mona-lisa-share-container")
      .querySelector(".top-controls")
  );

const amogi = [
  //  ###
  // ##
  // ####
  //  # #
  [
    [0, 1, 1, 1],
    [1, 1, 0, 0],
    [1, 1, 1, 1],
    [0, 1, 0, 1],
  ],
  // ###
  //   ##
  // ####
  // # #
  [
    [1, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 1, 1, 1],
    [1, 0, 1, 0],
  ],

  // ###
  // #
  // ###
  // # #
  [
    [0, 0, 0, 0],
    [0, 1, 1, 1],
    [0, 1, 0, 0],
    [0, 1, 1, 1],
    [0, 1, 0, 1],
    [0, 0, 0, 0],
  ],
  // ###
  //   #
  // ###
  // # #
  [
    [0, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [1, 0, 1, 0],
  ],

  //  ###
  // ##
  // ####
  //  ###
  //  # #
  [
    [0, 1, 1, 1],
    [1, 1, 0, 0],
    [1, 1, 1, 1],
    [0, 1, 1, 1],
    [0, 1, 0, 1],
  ],
  // ###
  //   ##
  // ####
  // ###
  // # #
  [
    [1, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 0],
    [1, 0, 1, 0],
  ],
  //  ###
  // ##
  // ####
  // ####
  //  ###
  //  # #
  [
    [0, 1, 1, 1],
    [1, 1, 0, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 1, 1],
    [0, 1, 0, 1],
  ],
  // ###
  //   ##
  // ####
  // ####
  // ###
  // # #
  [
    [1, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 0],
    [1, 0, 1, 0],
  ],
  //  ###
  // ##
  // ####
  // ####
  //  ###
  //  # #
  [
    [0, 1, 1, 1],
    [1, 1, 0, 0],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [0, 1, 0, 1],
  ],
  // ###
  //   ##
  // ####
  // ####
  // ###
  // # #
  [
    [1, 1, 1, 0],
    [0, 0, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 0, 1, 0],
  ],
];

function hex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

const topBarOffset = 20;
const findAmogus = (canvasContext) => {
  console.log(canvasContext.canvas, canvasContext);
  const imgData = canvasContext.getImageData(0, 0, 2000, 1000);
  const { data: pixelData } = imgData;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = 2000;
  outCanvas.height = 1000 + topBarOffset;

  const outContext = outCanvas.getContext("2d");
  outContext.imageSmoothingEnabled = false;
  outContext.fillStyle = "#000000";
  outContext.fillRect(0, 0, 2000, 1000 + topBarOffset);
  outContext.putImageData(imgData, 0, topBarOffset);
  outContext.globalAlpha = 0.75;
  outContext.fillStyle = "#000000";
  outContext.fillRect(0, topBarOffset, 2000, 1000);
  outContext.globalAlpha = 1.0;

  const getPixel = (x, y) => {
    if (x >= 2000 || y >= 1000 || x < 0 || y < 0) {
      return null;
    }

    if ((y * 2000 + x) * 4 > 8000000) {
      debugger;
    }

    const pixelLocation = (y * 2000 + x) * 4;
    // console.log(pixelLocation);

    return `#${hex(pixelData[pixelLocation])}${hex(
      pixelData[pixelLocation + 1]
    )}${hex(pixelData[pixelLocation + 2])}`;
  };
  window.getPixel = getPixel;
  let amogusLocations = [];
  const totalPixels = 2000 * 1000;
  let progress;
  outContext.save();
  for (let j = 0; j < 1000; j++) {
    for (let i = 0; i < 2000; i++) {
      progress = (j * 2000 + i) / totalPixels;
      // if (progress > 0.01) break;

      for (let amogus of amogi) {
        let significantColor;
        let queueColors = [];
        let isAmogus = true;
        for (let x = 0; x < amogus[0].length; x++) {
          for (let y = 0; y < amogus.length; y++) {
            const targetPixel = getPixel(i + x, j + y);

            const isSignificant = amogus[y][x];
            if (isSignificant) {
              if (!significantColor) {
                significantColor = targetPixel;

                if (queueColors.length) {
                  // none of the queue colors can be significant color
                  if (queueColors.some((color) => color === significantColor)) {
                    isAmogus = false;
                    break;
                  }

                  // none of the queue colors were significant color so we're good to go, clear queue
                  queueColors = [];
                }
                continue;
              }

              // doesnt match significant color
              if (significantColor != targetPixel) {
                isAmogus = false;
                break;
              }
            } else {
              if (significantColor) {
                if (targetPixel === significantColor) {
                  // cant be the same as insignificant color
                  isAmogus = false;
                  break;
                }
              } else {
                // no significant color yet, save for when we reach first significant color
                queueColors.push(targetPixel);
              }
            }
          }
          if (!isAmogus) break;
        }

        if (isAmogus) {
          amogusLocations.push([i, j]);

          // amogus shape highlight
          // const amogusW = amogus[0].length;
          // const amogusH = amogus.length;
          // const locationPixelData = canvasContext.getImageData(
          //   i,
          //   j,
          //   amogusW,
          //   amogusH
          // );

          // for (let x = 0; x < amogus[0].length; x++) {
          //   for (let y = 0; y < amogus.length; y++) {
          //     const pixelLocation = (y * amogusW + x) * 4;

          //     if (amogus[y][x]) {
          //       locationPixelData.data[pixelLocation] = 255;
          //       locationPixelData.data[pixelLocation + 1] = 0;
          //       locationPixelData.data[pixelLocation + 2] = 0;
          //       locationPixelData.data[pixelLocation + 3] = 255;
          //     }
          //   }
          // }
          // outContext.putImageData(locationPixelData, i, j + topBarOffset);
          break; // only need to match one
        }
      }
    }

    console.log(`${(progress * 100).toFixed(2)}%`);
  }

  for (let [i, j] of amogusLocations) {
    outContext.strokeStyle = "#ff0000";
    outContext.globalAlpha = 1.0;

    outContext.save();
    outContext.beginPath();
    outContext.arc(i + 2, j + 2 + topBarOffset, 5, 0, 2 * Math.PI, true);
    outContext.clip();
    outContext.drawImage(
      canvasContext.canvas,
      i - 10,
      j - 10,
      20,
      20,
      i - 10,
      j - 10 + topBarOffset,
      20,
      20
    );
    outContext.restore();
  }

  const utcDate = new Date().toUTCString();

  outContext.globalAlpha = 1.0;
  outContext.font = "12px monospace";
  outContext.fillStyle = "#ff0000";
  outContext.fillText(`${amogusLocations.length} ඞ`, 10, 14);
  outContext.textAlign = "right";
  outContext.fillText(
    `Date (UTC): ${utcDate.substring(0, utcDate.length - 4)}`,
    outContext.canvas.width - 10,
    14
  );
  // outContext.textAlign = "center";
  // outContext.fillText("ඞ analyzer", outContext.canvas.width / 2, 14);

  console.log(`found ${amogusLocations.length} amogus`);
  console.table(amogusLocations.slice(0, 50));

  const scaleFactor = 2;
  const scaleOutputCanvas = document.createElement("canvas");
  scaleOutputCanvas.width = outContext.canvas.width * scaleFactor;
  scaleOutputCanvas.height = outContext.canvas.height * scaleFactor;

  const scaleOutputContext = scaleOutputCanvas.getContext("2d");
  scaleOutputContext.imageSmoothingEnabled = false;
  console.log(outContext.canvas.width, outContext.canvas.height);
  console.log(scaleOutputCanvas.width, scaleOutputCanvas.height);
  scaleOutputContext.drawImage(
    outCanvas,
    0,
    0,
    outContext.canvas.width,
    outContext.canvas.height,
    0,
    0,
    outContext.canvas.width * scaleFactor,
    outContext.canvas.height * scaleFactor
  );
  console.log(scaleOutputContext.canvas);
  scaleOutputContext.canvas.toBlob((blob) => {
    console.log(blob);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }, "image/png");
};

const init = async () => {
  const canvas = await findCanvas();
  const toolbar = await findToolbar();
  console.log({ canvas });
  console.log({ toolbar });

  const amogusButton = document.createElement("button");
  amogusButton.type = "button";
  amogusButton.style.pointerEvents = "all";
  amogusButton.innerText = "amogus finder";
  amogusButton.addEventListener("click", () => {
    console.log("find amogus called");
    findAmogus(canvas.getContext("2d"));
  });

  toolbar.insertBefore(
    amogusButton,
    toolbar.querySelector("mona-lisa-help-button")
  );
};

init();
