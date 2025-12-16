function getWasmHeightmap(size, octaves, freq, scale, seed) {
  if (typeof Module === "undefined") {
    console.error("Error: WebAssembly is not ready yet.");
    return null;
  }

  if (!Module.generateHeightmap) {
    try {
      Module.generateHeightmap = Module.cwrap("Module", "number", [
        "number",
        "number",
        "number",
        "number",
        "number",
      ]);
    } catch (e) {
      console.error("Failed to bind C++ function.", e);
      return null;
    }
  }
  console.time("C++ Compute Time");

  const dataPtr = Module._generateHeightmap(size, octaves, freq, seed, scale);

  console.timeEnd("C++ Compute Time");
  const totalFloats = size * size;
  let heightData = new Float32Array(
    Module.HEAPF32.buffer,
    dataPtr,
    totalFloats
  );
  console.groupCollapsed("Wasm Heightmap Data Inspection");
  console.log(`Pointer Address: ${dataPtr}`);
  console.log(`Total Elements: ${heightData.length}`);
  console.log(`First Value: ${heightData[0]}`);
  console.groupEnd();

  return heightData;
}

function getWasmTreeLocation(size, treeLine, density, maxSlope, seed, scale) {
  if (!Module.placeTrees) {
    try {
      Module.placeTrees = Module.cwrap("placeTrees", "number", [
        "number",
        "number",
        "number",
        "number",
        "number",
        "number",
      ]);
    } catch (e) {
      console.error("Failed to bind C++ function.", e);
      return null;
    }
  }

  if (!Module.getTreeCount) {
    try {
      Module.getTreeCount = Module.cwrap("getTreeCount", "number", []);
    } catch (e) {
      console.error("Failed to bind getTreeCount.", e);
      return null;
    }
  }

  console.time("C++ Compute Time");
  const treeDataPtr = Module._placeTrees(
    size,
    treeLine,
    density,
    maxSlope,
    seed,
    scale
  );
  const totalFloats = Module._getTreeCount();
  console.timeEnd("C++ Compute Time");

  let treePlacement = new Float32Array(
    Module.HEAPF32.buffer,
    treeDataPtr,
    totalFloats
  );

  console.groupCollapsed("Wasm Tree Placement Data Inspection");
  console.log(`Pointer Address: ${treeDataPtr}`);
  console.log(`Total Elements: ${treeDataPtr.length}`);
  console.log(`First Value: ${treeDataPtr[0]}`);
  console.groupEnd();

  return treePlacement;
}
