#version 300 es
precision highp float;

in vec3 vPos;
in vec3 vNor;

uniform vec3 uLightPos;
uniform vec3 uFlatColor;
uniform vec3 uSteepColor;
uniform float uSteepness;
uniform float uLightStrength;
uniform float uAmbientStrength;

out vec4 fragColor;

void main() {
    vec3 N = normalize(vNor);
    vec3 L = normalize(uLightPos - vPos); 
    vec3 V = normalize(-vPos);

    vec3 terrainColor;
    if(N.y < uSteepness) {
        terrainColor = uSteepColor;
    } else {
        terrainColor = uFlatColor;
    }

    float diff = max(dot(N, L), 0.0);
    
    vec3 R = reflect(-L, N);
    float spec = pow(max(dot(V, R), 0.0), 64.0) * 0.5;
    vec3 lightCalc = (uFlatColor * uLightStrength) * (diff + uAmbientStrength + spec);
    vec3 result = terrainColor * uLightStrength * (diff + uAmbientStrength + spec);

    fragColor = vec4(result, 1.0);
}