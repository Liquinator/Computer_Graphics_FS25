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
      console.error(
        "Failed to bind C++ function. Did you add it to EXPORTED_FUNCTIONS in compilation?",
        e
      );
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
  console.log(`Middle Value: ${heightData[Math.floor(heightData.length / 2)]}`);

  if (
    heightData[0] === 0 &&
    heightData[1] === 0 &&
    heightData[Math.floor(heightData.length / 2)] === 0
  ) {
    console.warn(
      "⚠️ Warning: The generated data appears to be all zeros. Check your C++ logic or seed."
    );
  } else {
    console.log("Data looks populated.");
  }
  console.groupEnd();

  return heightData;
}
