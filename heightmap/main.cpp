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
float* placeTrees(int dim, float treeLine, float density, int seed) {
  HeightmapConfig heightConfig;
  heightConfig.seed = seed;
  auto map2d = generate_heightmap_seq(dim, heightConfig);
  TreePlacementConfig treeConfig;
  treeConfig.treeLine = treeLine;
  treeConfig.treeDensity = density;

  auto moistureMap = generate_heightmap_seq(dim, heightConfig);
  auto trees = place_trees_seq(map2d, moistureMap, treeConfig);

  flat_tree_positions.clear();
  flat_tree_positions.reserve(trees.size() * 2);

  for (const auto& pos : trees) {
    flat_tree_positions.push_back(pos.x);
    flat_tree_positions.push_back(pos.y);
  }

  return flat_tree_positions.data();
}

EMSCRIPTEN_KEEPALIVE
int getTreeCount() { return flat_tree_positions.size(); }
};
