let heightmapMesh = null;
let treeMesh = null;

export let rotationX = 0.5;
export let rotationY = 0.3;
export let scaleFactor = 1.0;

const lightConfig = {
  pos: [100, 300, 200],
  lookDir: [0.0, 0.0, 1.0],

  flatColor: [0.294, 0.545, 0.231],
  steepColor: [0.337, 0.337, 0.337],

  treeTrunkColor: [0.325, 0.208, 0.039],
  treeLeavesColor: [0.3, 0.4, 0.2],

  steepness: 0.75,
  lightStrength: 1.2,
  ambientStrength: 0.3,
};

export function createTreeMesh() {
  const vertices = [];
  const segments = 6;
  const trunkHeight = 1.0;
  const trunkRadius = 0.1;
  const leafHeight = 1.0;
  const leafBottomRadius = 0.5;
  const totalHeight = trunkHeight + leafHeight;

  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * 2 * Math.PI;
    const angle2 = ((i + 1) / segments) * 2 * Math.PI;

    const x1 = Math.cos(angle1) * trunkRadius;
    const z1 = Math.sin(angle1) * trunkRadius;
    const x2 = Math.cos(angle2) * trunkRadius;
    const z2 = Math.sin(angle2) * trunkRadius;

    const bx1 = x1,
      by1 = 0,
      bz1 = z1;
    const bx2 = x2,
      by2 = 0,
      bz2 = z2;

    const tx1 = x1,
      ty1 = trunkHeight,
      tz1 = z1;
    const tx2 = x2,
      ty2 = trunkHeight,
      tz2 = z2;

    const nx1 = Math.cos(angle1),
      nz1 = Math.sin(angle1);
    const nx2 = Math.cos(angle2),
      nz2 = Math.sin(angle2);

    vertices.push(bx1, by1, bz1, nx1, 0, nz1);
    vertices.push(bx2, by2, bz2, nx2, 0, nz2);
    vertices.push(tx1, ty1, tz1, nx1, 0, nz1);
    vertices.push(bx2, by2, bz2, nx2, 0, nz2);
    vertices.push(tx2, ty2, tz2, nx2, 0, nz2);
    vertices.push(tx1, ty1, tz1, nx1, 0, nz1);
  }

  const leafTopY = trunkHeight + leafHeight;
  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * 2 * Math.PI;
    const angle2 = ((i + 1) / segments) * 2 * Math.PI;

    const x1 = Math.cos(angle1) * leafBottomRadius;
    const z1 = Math.sin(angle1) * leafBottomRadius;
    const x2 = Math.cos(angle2) * leafBottomRadius;
    const z2 = Math.sin(angle2) * leafBottomRadius;

    const bx1 = x1,
      by1 = trunkHeight,
      bz1 = z1;
    const bx2 = x2,
      by2 = trunkHeight,
      bz2 = z2;

    const tx = 0,
      ty = leafTopY,
      tz = 0;

    const nx1 = Math.cos(angle1),
      nz1 = Math.sin(angle1);
    const nx2 = Math.cos(angle2),
      nz2 = Math.sin(angle2);
    const nTop = 0,
      nyTop = 1,
      nzTop = 0;
    vertices.push(bx1, by1, bz1, nx1, 0.5, nz1);
    vertices.push(bx2, by2, bz2, nx2, 0.5, nz2);
    vertices.push(tx, ty, tz, nTop, nyTop, nzTop);

    vertices.push(bx2, by2, bz2, nx2, 0.5, nz2);
    vertices.push(tx, ty, tz, nTop, nyTop, nzTop);
    vertices.push(bx1, by1, bz1, nx1, 0.5, nz1);
  }

  return {
    triangle_strip: false,
    data: new Float32Array(vertices),
  };
}

export function createTreePlacement(treePlacementData, heightmapConfig) {
  const treeVertexData = [];
  const baseTreeData = createTreeMesh().data;
  const size = treePlacementData.length;

  for (let x = 0; x < size; x += 3) {
    const worldX = treePlacementData[x] - heightmapConfig.size / 2;
    const worldZ = treePlacementData[x + 1] - heightmapConfig.size / 2;
    const height = treePlacementData[x + 2] * heightmapConfig.scale;
    let treeMatrix = new Matrix().move(worldX, height, worldZ).get();

    for (let i = 0; i < baseTreeData.length; i += 6) {
      const pos = transform(treeMatrix, [
        baseTreeData[i],
        baseTreeData[i + 1],
        baseTreeData[i + 2],
        1,
      ]);
      const nor = transform(treeMatrix, [
        baseTreeData[i + 3],
        baseTreeData[i + 4],
        baseTreeData[i + 5],
        0,
      ]);

      treeVertexData.push(pos[0], pos[1], pos[2], nor[0], nor[1], nor[2]);
    }
  }
  treeMesh = {
    triangle_strip: false,
    data: new Float32Array(treeVertexData),
  };
}

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
    setUniform("3fv", "uTreeTrunkColor", lightConfig.treeTrunkColor);
    setUniform("3fv", "uTreeLeavesColor", lightConfig.treeLeavesColor);

    setUniform("1i", "uIsTree", 0);
    drawObj(heightmapMesh, modelMatrix, [(1, 1, 1)]);
    if (treeMesh) {
      setUniform("1i", "uIsTree", 1);
      drawObj(treeMesh, modelMatrix, [(1, 1, 1)]);
    }
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
