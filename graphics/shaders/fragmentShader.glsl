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

out vec4 fragColor;

void main() {
    vec3 N = normalize(vNor);
    vec3 localN = normalize(vLocalNor);
    vec3 L = normalize(uLightPos - vPos); 
    vec3 V = normalize(-vPos);
    float alpha = 1.0;

    vec3 terrainColor;
    if(localN.y < uSteepness) {
        terrainColor = uSteepColor;
    } else {
        terrainColor = uFlatColor;
    }

    float diff = max(dot(N, L), 0.0);
    
    vec3 R = reflect(-L, N);
    float spec = pow(max(dot(V, R), 0.0), 64.0) * 0.5;
    vec3 lightCalc = (uFlatColor * uLightStrength) * (diff + uAmbientStrength + spec);
    vec3 result = terrainColor * uLightStrength * (diff + uAmbientStrength + spec);

    float fogStart = 2.0;
    float fogEnd = 7.0;
    float fogFactor = clamp((vDist - fogStart) / (fogEnd - fogStart), 0.0, 1.0);
    vec3 fogColor = vec3(0.6, 0.8, 0.9);

    vec3 finalColor = mix(result, fogColor, fogFactor);

    fragColor = vec4(finalColor, alpha);
}