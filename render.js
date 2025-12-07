let heightmapMesh = null;
export let rotationX = 0.5;
export let rotationY = 0.3;
export let scaleFactor = 1.0;

export function createHeightmapMesh(heightmapData, size) {
  const vertexData = [];

  function addVertex(x, y) {
    const height = heightmapData[x * size + y] * 60;
    vertexData.push(x - size / 2);
    vertexData.push(height);
    vertexData.push(y - size / 2);

    const calcNormal = (nx, ny) => {
      nx = Math.max(0, Math.min(size - 1, nx));
      ny = Math.max(0, Math.min(size - 1, ny));
      return heightmapData[nx * size + ny];
    };

    const hL = calcNormal(x - 1, y);
    const hR = calcNormal(x + 1, y);
    const hD = calcNormal(x, y - 1);
    const hU = calcNormal(x, y + 1);

    let nx = hL - hR;
    let ny = 2.0;
    let nz = hD - hU;

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

export function createVertexShader() {
  return `#version 300 es
precision highp float;
// in_Position was bound to attribute index 0 and in_Color was bound to attribute index 1
in vec3 in_Position;
in vec3 in_Normal;

//Lighting
uniform vec3 lightCol;
uniform vec3 lightPos;
uniform vec3 lookDir;
uniform float lightStrength;

//Color Stuff
uniform vec3 flatColor;
uniform vec3 steepColor;
uniform float steepness;

//Uniforms
uniform mat4 model;
uniform mat4 projectionCamera;
uniform mat4 dbmvp;

// We output the ex_Color variable to the next shader in the chain
out vec4 ex_Color;
out vec3 ex_Normal;
out vec2 ex_Position;
out vec4 ex_Shadow;
out vec3 ex_FragPos;

void main(void) {
	//Position Calculations
	ex_FragPos = (model * vec4(in_Position, 1.0f)).xyz;
	ex_Shadow = dbmvp * vec4(ex_FragPos, 1.0f);
	gl_Position = projectionCamera * vec4(ex_FragPos, 1.0f);
	ex_Position = ((gl_Position.xyz / gl_Position.w).xy * 0.5 + 0.5 );
	ex_Normal = in_Normal;

	//Color Calculations - Per Vertex! Not Fragment.
	float diffuse = clamp(dot(normalize(in_Normal), normalize(lightPos)), 0.1,  0.9);
	float ambient = 0.01;
	float specular = 0.5*pow(max(dot(normalize(lookDir), normalize(reflect(lightPos, in_Normal))), 0.1), 64.0);

	//Color Stuff
	if(normalize(ex_Normal).y < steepness) ex_Color = vec4(steepColor, 1.0)*vec4(lightCol*lightStrength*(diffuse + ambient + specular), 1.0f);
	else ex_Color = vec4(flatColor, 1.0)*vec4(lightCol*lightStrength*(diffuse + ambient + specular), 1.0f);
}`;
}

export function createFragmentShader() {
  return `#version 300 es
precision highp float;
//Lighting Settings
uniform vec3 lightCol;
uniform vec3 lightPos;
uniform vec3 lookDir;
uniform float lightStrength;

//Sampler for the ShadowMap
uniform sampler2D shadowMap;

//IO
in vec4 ex_Color;
in vec3 ex_Normal;
in vec2 ex_Position;
in vec4 ex_Shadow;
in vec3 ex_FragPos;
out vec4 fragColor;

//Sample a grid..
float gridSample(int size){
  //Stuff
  float shadow = 0.0;
  float currentDepth = ex_Shadow.z;

  //Compute Bias
  float m = 1.0 - dot(ex_Normal, normalize(lightPos));
  float bias = mix(0.002, 0.2*m, pow(m, 5.0));

  for(int x = -size; x <= size; ++x){
      for(int y = -size; y <= size; ++y){
          float pcfDepth = texture(shadowMap, ex_Shadow.xy + vec2(x, y) / vec2(textureSize(shadowMap, 0))).r;
          shadow += currentDepth - 0.001 > pcfDepth ? 1.0 : 0.0;
      }
  }
  //Normalize
  float area = float((2*size+1)*(2*size+1));
  shadow/=(area * 2.0);
  return shadow;
}

vec4 shade(){
    //Shadow Value
    float shadow = 0.0;
    if(greaterThanEqual(ex_Shadow.xy, vec2(0.0f)) == bvec2(true) && lessThanEqual(ex_Shadow.xy, vec2(1.0f)) == bvec2(true))
      shadow = gridSample(1);

    //Sample the Shadow Value from Texture
    return vec4(vec3(1.0-shadow), 1.0f);
}

void main(void) {
  fragColor = shade()*ex_Color;
}`;
}

export function updateScene(heightmapConfig) {
  if (heightmapMesh) {
    setUniform("1f", "uScale", heightmapConfig.scale);
    let fitScale = 1.5 / heightmapConfig.size;
    let finalScale = fitScale * scaleFactor;

    drawObj(
      heightmapMesh,
      new Matrix()
        .scale(finalScale, finalScale, finalScale)
        .turnX(rotationX)
        .turnY(rotationY)
        .get(),
      [0, 0, 0]
    );
  }
}
