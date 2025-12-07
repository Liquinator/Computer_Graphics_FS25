import * as Render from "./render.js";

let heightmapConfig = {
  size: 512,
  octaves: 20,
  frequency: 2.0,
  scale: 60,
  seed: 42,
};

document.addEventListener("DOMContentLoaded", () => {
  const btnGenerate = document.getElementById("generate");
  const inputSize = document.getElementById("size");
  const inputOctaves = document.getElementById("octaves");
  const inputFreq = document.getElementById("frequency");
  const inputScale = document.getElementById("scale");
  const inputSeed = document.getElementById("seed");

  [inputSize, inputOctaves, inputFreq, inputScale, inputSeed].forEach((el) => {
    el.addEventListener("input", (e) => {
      document.getElementById(`${e.target.id}-value`).textContent =
        e.target.value;
    });
  });

  btnGenerate.addEventListener("click", () => {
    const size = parseInt(inputSize.value);
    const octaves = parseInt(inputOctaves.value);
    const freq = parseFloat(inputFreq.value);
    const scale = parseFloat(inputScale.value);
    const seed = parseInt(inputSeed.value);

    console.log(
      `Generating: Size=${size}, Oct=${octaves}, Freq=${freq}, Seed=${seed}`
    );
    const data = getWasmHeightmap(size, octaves, freq, scale, seed);

    if (data) {
      Render.createHeightmapMesh(data, size);
    }
  });
});

function initHeightmapApp() {
  const canvas = document.getElementById("glCanvas");
  const generateBtn = document.getElementById("generate");
  const randomSeedBtn = document.getElementById("random-seed");

  setupControlListeners();
  setupMouseControls();

  setTimeout(async () => {
    gl_start(canvas, {
      vertexShader: await Render.createVertexShader(),
      fragmentShader: await Render.createFragmentShader(
        "/graphics/fragmentShader"
      ),
      update: () => Render.updateScene(heightmapConfig),
    });
    const data = getWasmHeightmap(256, 20, 2.0, 60, 42);
    if (data) {
      Render.createHeightmapMesh(data, 256);
    }
  }, 200);

  const data = getWasmHeightmap(256, 20, 2.0, 60, 42);
  Render.createHeightmapMesh(data, 256);
}

function setupControlListeners() {
  const control = [{ id: "size", display: "size-value" }];
}

function setupMouseControls() {
  mouse.drag = function (dx, dy) {
    rotationX += dy * -0.5;
    rotationY += dx * -0.5;
  };

  document.addEventListener(
    "wheel",
    function (e) {
      if (e.target.id === "glCanvas") {
        e.preventDefault();
        scaleFactor += e.deltaY * -0.001;
        scaleFactor = Math.max(0.1, Math.min(5.0, scaleFactor));
      }
    },
    { passive: false }
  );
}

window.addEventListener("load", initHeightmapApp);
