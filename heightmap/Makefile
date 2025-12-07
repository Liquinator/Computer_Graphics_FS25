CXX = emcc
INCLUDES = -I. -I/usr/local/Cellar/glm/1.0.1/include
CXXFLAGS = $(INCLUDES) -O3 -std=c++17 

# Emscripten Specific Linker Flags
# WASM=1                   : Compile to WebAssembly (not asm.js)
# ALLOW_MEMORY_GROWTH=1    : Allows the heap to resize if your vectors get big
# EXPORTED_RUNTIME_METHODS : Enables ccall/cwrap so JS can call C++
# MODULARIZE=1             : Wraps output in a Module function (cleaner JS)
# EXPORT_NAME              : The name of the function JS calls to load the Wasm
EMFLAGS = -s WASM=1 \
          -s ALLOW_MEMORY_GROWTH=1 \
          -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap", "HEAPF32"]' \
          -s MODULARIZE=1 \
          -s "EXPORT_NAME='Module'" \
  		-s ENVIRONMENT=web \

SOURCES = main.cpp
OUTPUT = wasm_build/simulation.js

all: $(OUTPUT)
$(OUTPUT): $(SOURCES)
	mkdir -p wasm_build
	$(CXX) $(SOURCES) $(CXXFLAGS) $(EMFLAGS) -o $(OUTPUT)

clean:
	rm -rf wasm_build