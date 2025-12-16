#include <emscripten.h>

#include <algorithm>
#include <vector>

#include "heightmap_gen.hpp"
#include "tree_gen.hpp"

std::vector<float> heightmap;
std::vector<float> tree_positions;
std::vector<float> flat_tree_positions;

extern "C" {
EMSCRIPTEN_KEEPALIVE
float* generateHeightmap(int dim, int octaves, double freq, int seed,
                         double scale) {
  HeightmapConfig config;
  config.octaves = octaves;
  config.frequency = freq;
  config.seed = static_cast<unsigned int>(seed);
  config.scale = scale;

  auto map2d = generate_heightmap_seq(dim, config);
  int totalSize = dim * dim;
  heightmap.resize(totalSize);

  for (int x = 0; x < dim; x++) {
    for (int y = 0; y < dim; y++) {
      heightmap[x * dim + y] = static_cast<float>(map2d[x][y]);
    }
  }

  return heightmap.data();
}

EMSCRIPTEN_KEEPALIVE
float* placeTrees(int dim, float treeLine, float density, float maxSlope,
                  int seed, float scale) {
  HeightmapConfig moistureMapConfig;
  moistureMapConfig.seed = seed;

  TreePlacementConfig treeConfig;
  treeConfig.treeLine = treeLine;
  treeConfig.treeDensity = density;
  treeConfig.maxSlope = maxSlope;
  treeConfig.scale = scale;

  auto moistureMap = generate_heightmap_seq(dim, moistureMapConfig);
  auto trees = place_trees_seq(heightmap, moistureMap, treeConfig);

  flat_tree_positions.clear();
  flat_tree_positions.reserve(trees.size() * 3);

  for (const auto& pos : trees) {
    flat_tree_positions.push_back(pos.x);
    flat_tree_positions.push_back(pos.y);
    flat_tree_positions.push_back(pos.z);
  }

  return flat_tree_positions.data();
}

EMSCRIPTEN_KEEPALIVE
int getTreeCount() { return flat_tree_positions.size(); }
};
