#version 300 es
precision highp float;

in vec3 vPos;
in vec3 vNor;
in vec3 vLocalNor;
in float vDist;

uniform vec3 uLightPos;
uniform vec3 uFlatColor;
uniform vec3 uSteepColor;
uniform float uSteepness;

uniform float uLightStrength;
uniform float uAmbientStrength;

uniform vec3 uTreeTrunkColor;
uniform vec3 uTreeLeavesColor;
uniform int uIsTree;

out vec4 fragColor;

void main() {
    vec3 N = normalize(vNor);
    vec3 localN = normalize(vLocalNor);
    vec3 L = normalize(uLightPos - vPos); 
    vec3 V = normalize(-vPos);
    float alpha = 1.0;

    vec3 baseColor;

    if (uIsTree == 1) {
        float treeMix = smoothstep(0.2, 0.6, localN.y);
        baseColor = mix(uTreeTrunkColor, uTreeLeavesColor, treeMix);
    } else {
        float terrainMix = smoothstep(uSteepness - 0.15, uSteepness + 0.15, localN.y);
        baseColor = mix(uSteepColor, uFlatColor, terrainMix);
    }

    float diff = max(dot(N, L), 0.0);
    vec3 R = reflect(-L, N);
    float spec = pow(max(dot(V, R), 0.0), 64.0) * 0.5;

    float rim = 1.0 - max(dot(V, N), 0.0);
    rim = smoothstep(0.6, 1.0, rim);
    vec3 rimColor = vec3(0.8, 0.9, 1.0) * rim * 0.3;

    vec3 lightCalc = (baseColor * uLightStrength) * (diff + uAmbientStrength + spec) + rimColor;
    vec3 result = baseColor * uLightStrength * (diff + uAmbientStrength + spec);

    float fogStart = 5.0; 
    float fogEnd = 10.0; 


   float fogFactor = smoothstep(fogStart, fogEnd, vDist);
    vec3 fogColor = vec3(0.6, 0.8, 0.9);

    vec3 finalColor = mix(result, fogColor, fogFactor);

    fragColor = vec4(finalColor, alpha);
}