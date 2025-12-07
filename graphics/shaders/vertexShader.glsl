#version 300 es
in vec3 aPos;
in vec3 aNor;
uniform mat4 uMF, uMI;
out vec3 vPos;
out vec3 vNor;

void main() {
   vec4 pos = uMF * vec4(aPos, 1.0);
   vec4 nor = vec4(aNor, 0.0) * uMI; 
   
   gl_Position = pos * vec4(1.0, 1.0, -0.1, 1.0); 
   
   vPos = pos.xyz;
   vNor = nor.xyz;
}