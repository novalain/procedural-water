varying vec2 vUv;
varying float elevation;

//uniform float time;
//uniform sampler2D myTexture;

const vec4 sand = vec4(0.7, 0.6, 0.5, 1.0);
const vec4 grass = vec4(31.0/255.0, 49.0/255.0, 0.0, 1.0);
const vec4 dirt = vec4(25.0/255.0, 17.0/255.0, 0.0/255.0, 1.0);

void main() {
  float noise = 0.25  * snoise(vec3(0.03 * vUv.x, 0.03 * vUv.y, 1.0)) +
                0.125 * snoise(vec3(0.1 * vUv.x, 0.1 * vUv.y, 1.0))  +
                0.075 * snoise(vec3(0.2 * vUv.x, 0.2 * vUv.y, 1.0));

  vec4 bottomColor = mix(dirt, sand, 0.3 * clamp(noise, 0.0, 1.0));
  vec4 terrainColor = mix(grass, sand , 0.15 * clamp(noise, 0.0, 1.0));

  // Interpolate between colors depending on elevation
  vec4 result = mix(bottomColor, terrainColor, clamp(elevation * 0.02, 0.0, 1.0));

  gl_FragColor = result;
}
