let heightmapMesh = null;
export let rotationX = 0.5;
export let rotationY = 0.3;
export let scaleFactor = 1.0;

const lightConfig = {
  pos: [100, 300, 200],
  lookDir: [0.0, 0.0, 1.0],

  flatColor: [0.294, 0.545, 0.231],
  steepColor: [0.337, 0.337, 0.337],

  steepness: 0.75,
  lightStrength: 1.2,
  ambientStrength: 0.3,
};

export function createTree(heightmapData, moistureMapConfig) {}

export function createHeightmapMesh(heightmapData, heightmapConfig) {
  const vertexData = [];

  function addVertex(x, y) {
    const height = heightmapData[x * heightmapConfig.size + y];
    vertexData.push(x - heightmapConfig.size / 2);

    vertexData.push(height);
    vertexData.push(y - heightmapConfig.size / 2);
    const getH = (nx, ny) => {
      nx = Math.max(0, Math.min(heightmapConfig.size - 1, nx));
      ny = Math.max(0, Math.min(heightmapConfig.size - 1, ny));
      return heightmapData[nx * heightmapConfig.size + ny];
    };

    const hL = getH(x - 1, y);
    const hR = getH(x + 1, y);
    const hD = getH(x, y - 1);
    const hU = getH(x, y + 1);
    let nx = hL - hR;
    let ny = 2.0;
    let nz = hD - hU;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    vertexData.push(nx / len);
    vertexData.push(ny / len);
    vertexData.push(nz / len);
  }

  for (let x = 0; x < heightmapConfig.size - 1; x++) {
    for (let y = 0; y < heightmapConfig.size - 1; y++) {
      addVertex(x, y);
      addVertex(x + 1, y);
      addVertex(x, y + 1);
      addVertex(x + 1, y);
      addVertex(x + 1, y + 1);
      addVertex(x, y + 1);
    }
  }

  heightmapMesh = {
    triangle_strip: false,
    data: new Float32Array(vertexData),
  };

  return heightmapMesh;
}

export async function createVertexShader() {
  const fragmentShader = await loadShaderFile(
    "graphics/shaders/vertexShader.glsl"
  );
  return fragmentShader;
}

export async function createFragmentShader() {
  const fragmentShader = await loadShaderFile(
    "graphics/shaders/fragmentShader.glsl"
  );
  return fragmentShader;
}

export function updateScene(heightmapConfig) {
  if (heightmapMesh) {
    let fitScale = 1.5 / heightmapConfig.size;
    let finalScale = fitScale * scaleFactor;
    let modelMatrix = new Matrix()
      .scale(finalScale, finalScale, finalScale)
      .turnX(rotationX)
      .turnY(rotationY)
      .get();

    let lightPos = transform(modelMatrix, [
      lightConfig.pos[0],
      lightConfig.pos[1],
      lightConfig.pos[2],
      1,
    ]);

    setUniform("3fv", "uLightPos", lightPos.slice(0, 3));
    setUniform("3fv", "uFlatColor", lightConfig.flatColor);
    setUniform("3fv", "uSteepColor", lightConfig.steepColor);
    setUniform("1f", "uSteepness", lightConfig.steepness);
    setUniform("1f", "uLightStrength", lightConfig.lightStrength);
    setUniform("1f", "uAmbientStrength", lightConfig.ambientStrength);

    drawObj(heightmapMesh, modelMatrix, [(1, 1, 1)]);
  }
}

async function loadShaderFile(path) {
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (error) {
    console.error(`Failed to load shader from ${path}`, error);
    return null;
  }
}
export function setupControlListeners() {
  const control = [{ id: "size", display: "size-value" }];
}

export function setupMouseControls() {
  mouse.drag = function (dx, dy) {
    rotationX += dy * -0.5;
    rotationY += dx * 0.5;
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
