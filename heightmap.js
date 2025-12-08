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
  console.groupCollapsed("Wasm Data Inspection");
  console.log(`Pointer Address: ${dataPtr}`);
  console.log(`Total Elements: ${heightData.length}`);
  console.log(`First Value: ${heightData[0]}`);
  console.groupEnd();

  return heightData;
}

function getWasmTreeLocation(size, treeLine, density, seed) {
  if (!Module.placeTrees) {
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

  const dataPtr = Module._placeTrees(size, treeLine, density, seed);

  console.timeEnd("C++ Compute Time");

  let treePlacement = new Float32Array(
    Module.HEAPF32.buffer,
    dataPtr,
    totalFloats
  );

  return treePlacement;
}
