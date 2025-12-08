import * as Render from "./render.js";

let heightmapConfig = {
  size: 256,
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
    heightmapConfig.size = parseInt(inputSize.value);
    heightmapConfig.octaves = parseInt(inputOctaves.value);
    heightmapConfig.freq = parseFloat(inputFreq.value);
    heightmapConfig.scale = parseFloat(inputScale.value);
    heightmapConfig.seed = parseInt(inputSeed.value);
    const data = getWasmHeightmap(
      heightmapConfig.size,
      heightmapConfig.octaves,
      heightmapConfig.freq,
      heightmapConfig.scale,
      heightmapConfig.seed
    );

    if (data) {
      Render.createHeightmapMesh(data, heightmapConfig);
    }
  });
});

function initHeightmapApp() {
  const canvas = document.getElementById("glCanvas");
  const generateBtn = document.getElementById("generate");
  const randomSeedBtn = document.getElementById("random-seed");

  Render.setupControlListeners();
  Render.setupMouseControls();

  setTimeout(async () => {
    gl_start(canvas, {
      vertexShader: await Render.createVertexShader(),
      fragmentShader: await Render.createFragmentShader(),
      update: () => Render.updateScene(heightmapConfig),
    });
    const data = getWasmHeightmap(256, 20, 2.0, 60, 42);
    if (data) {
      Render.createHeightmapMesh(data, heightmapConfig);
    }
  }, 200);

  const data = getWasmHeightmap(256, 20, 2.0, 60, 42);
  Render.createHeightmapMesh(data, heightmapConfig);
}

window.addEventListener("load", initHeightmapApp);
