let heightmapMesh = null;
export let rotationX = 0.5;
export let rotationY = 0.3;
export let scaleFactor = 1.0;

const lightConfig = {
  pos: [100.0, 300.0, 200.0],
  lookDir: [0.0, 0.0, 1.0],

  flatColor: [0.2, 0.6, 0.2],
  steepColor: [0.4, 0.3, 0.2],

  steepness: 0.85,
  lightStrength: 1.2,
  ambientStrength: 0.3,
};

export function createHeightmapMesh(heightmapData, size) {
  const vertexData = [];
  const heightScale = 60.0;

  function addVertex(x, y) {
    const height = heightmapData[x * size + y] * heightScale;
    vertexData.push(x - size / 2);
    vertexData.push(height);
    vertexData.push(y - size / 2);
    const getH = (nx, ny) => {
      nx = Math.max(0, Math.min(size - 1, nx));
      ny = Math.max(0, Math.min(size - 1, ny));
      return heightmapData[nx * size + ny];
    };

    const hL = getH(x - 1, y);
    const hR = getH(x + 1, y);
    const hD = getH(x, y - 1);
    const hU = getH(x, y + 1);
    let nx = (hL - hR) * heightScale;
    let ny = 2.0;
    let nz = (hD - hU) * heightScale;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    vertexData.push(nx / len);
    vertexData.push(ny / len);
    vertexData.push(nz / len);
  }

  for (let x = 0; x < size - 1; x++) {
    for (let y = 0; y < size - 1; y++) {
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
    setUniform("3fv", "uLightPos", lightConfig.pos);
    setUniform("3fv", "uFlatColor", lightConfig.flatColor);
    setUniform("3fv", "uSteepColor", lightConfig.steepColor);
    setUniform("1f", "uSteepness", lightConfig.steepness);
    setUniform("1f", "uLightStrength", lightConfig.lightStrength);
    setUniform("1f", "uAmbientStrength", lightConfig.ambientStrength);

    let fitScale = 1.5 / heightmapConfig.size;
    let finalScale = fitScale * scaleFactor;

    drawObj(
      heightmapMesh,
      new Matrix()
        .scale(finalScale, finalScale, finalScale)
        .turnX(rotationX)
        .turnY(rotationY)
        .get(),
      [1, 1, 1]
    );
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
