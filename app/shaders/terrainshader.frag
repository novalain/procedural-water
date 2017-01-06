varying vec2 vUv;
varying float elevation;
varying vec3 perturbedNormal;
varying vec3 toCamera;
varying vec3 fromLight;
//uniform float time;
//uniform sampler2D myTexture;
uniform float shineDamper;// = 20.0;
uniform float ks; //= 0.6;
uniform float kd;// = 0.0;
uniform float ka;// = 1.0;

const vec4 sand = vec4(0.7, 0.6, 0.5, 1.0);
const vec4 grass = vec4(31.0/255.0, 49.0/255.0, 0.0, 1.0);
const vec4 dirt = vec4(25.0/255.0, 17.0/255.0, 0.0/255.0, 1.0);

void calculateLightning(const vec3 surfaceNormal, const vec3 unitToCamera, float shiny,
              float spec, float diffuse, inout vec3 diffuseColor,
              inout vec3 specularColor){
  vec3 sunColor = vec3(1.0, 1.0, 1.0);
  vec3 unitFromLight = normalize(fromLight);
  vec3 reflection = normalize(reflect(unitFromLight, surfaceNormal));
  float direction = max(0.0, dot(unitToCamera, reflection));
  specularColor += pow(direction, shiny) * sunColor * spec;
  diffuseColor += max(dot(-unitFromLight, surfaceNormal), 0.0) * sunColor * diffuse;
}

void main() {
  float noise = 0.25  * snoise(vec3(0.03 * vUv.x, 0.03 * vUv.y, 1.0)) +
                0.125 * snoise(vec3(0.1 * vUv.x, 0.1 * vUv.y, 1.0))  +
                0.075 * snoise(vec3(0.2 * vUv.x, 0.2 * vUv.y, 1.0));

  vec4 bottomColor = mix(dirt, sand, 0.3 * clamp(noise, 0.0, 1.0));
  vec4 terrainColor = mix(grass, sand , 0.15 * clamp(noise, 0.0, 1.0));

  vec3 diffuseColor = vec3(0.0);
  vec3 specularColor = vec3(0.0);
  vec3 unitToCamera = normalize(toCamera);
  vec3 unitPerturbedNormal = normalize(perturbedNormal);
  calculateLightning(unitPerturbedNormal, unitToCamera, shineDamper, ks, kd, diffuseColor, specularColor);

  // Interpolate between colors depending on elevation
  vec4 result = mix(bottomColor, terrainColor, clamp(elevation * 0.02, 0.0, 1.0));

  gl_FragColor = result * ka + result * vec4(diffuseColor, 1.0); //* vec4(specularColor, 1.0);
}
