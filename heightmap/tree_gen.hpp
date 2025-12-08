#pragma once

#include <glm/glm.hpp>
#include <vector>

#include "heightmap_gen.hpp"
#include "perlin_noise.hpp"

struct TreePlacementConfig {
  float treeLine = 0.8;
  float maxSlope = 0.4;
  float treeDensity = 0.4;
  unsigned int moistureSeedOffset = 1;
  double scale = 60.0;
};

inline glm::vec3 surface_normal(int i, int j,
                                const std::vector<float>& heightmap,
                                const TreePlacementConfig& config) {
  int width = std::sqrt(heightmap.size());

  float h = heightmap[i * width + j];

  float h_left = (i > 0) ? heightmap[(i - 1) * width + j] * config.scale : h;
  float h_right =
      (i < width - 1) ? heightmap[(i + 1) * width + j] * config.scale : h;
  float h_up =
      (j < width - 1) ? heightmap[i * width + (j + 1)] * config.scale : h;
  float h_down = (j > 0) ? heightmap[i * width + (j - 1)] * config.scale : h;

  float dx = (h_right - h_left) / 2.0;
  float dy = (h_up - h_down) / 2.0;

  glm::vec3 normal(-dx, 1.0, -dy);
  return glm::normalize(normal);
}

inline std::vector<glm::vec3> place_trees_seq(
    const std::vector<float>& heightmap,
    const std::vector<std::vector<double>>& moisture_map,
    const TreePlacementConfig& config = TreePlacementConfig{}) {
  std::vector<glm::vec3> treeLocation;
  int dimension = std::sqrt(heightmap.size());

  glm::vec2 dim = glm::vec2(dimension, dimension);

  for (int x = 0; x < dim.x; x++) {
    for (int y = 0; y < dim.y; y++) {
      float height = heightmap[x * dimension + y] / config.scale;
      if (height > config.treeLine) continue;
      if ((float)moisture_map[x][y] / config.scale < config.treeDensity)
        continue;
      glm::vec3 surface_norm = surface_normal(x, y, heightmap, config);
      if (glm::dot(surface_norm, glm::vec3(0.0, 0.0, 1.0)) < config.maxSlope)
        continue;
      treeLocation.push_back(glm::vec3(x, y, height));
    }
  }
  return treeLocation;
}

inline std::vector<glm::vec3> place_trees(
    const std::vector<float>& heightmap, bool use_parallel = false,
    const TreePlacementConfig& treeConfig = TreePlacementConfig{},
    const HeightmapConfig& moistureMapConfig = HeightmapConfig{}) {
  int dimension = std::sqrt(heightmap.size());

  auto moisture_map =
      generate_heightmap(dimension, use_parallel, moistureMapConfig);
  return place_trees_seq(heightmap, moisture_map, treeConfig);
}