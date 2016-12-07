uniform float time;
uniform float waterMoveFactor;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvTexture; // For noise
uniform sampler2D normalMap;

varying vec2 vUv;
varying vec2 vUvTiled;
varying vec2 vUvManual;
varying vec4 posClipSpace;
varying vec3 toCamera;
varying vec3 fromLight;

const vec4 waterColor = vec4(0.0, 0.3, 0.5, 1.0);
const float waveStrength = 0.02;

// Lightning
const float shineDamper = 20.0;
const float reflectivity = 0.6;

// Phong specular term => Ks * (R dot V)^n
vec3 calculateSpecularHighlights(in float totalNoise, in vec3 unitToCamera) {
  vec3 perturbedNormal = normalize(vec3(totalNoise, 0.002, totalNoise));
  vec3 reflectedLight = reflect(normalize(fromLight), perturbedNormal);
  float specular = max(dot(reflectedLight, unitToCamera), 0.0);
  specular = pow(specular, shineDamper);
  vec3 result = vec3(1.0, 1.0, 1.0) * specular * reflectivity;
  return result;
}

float calculateSimplexNoise() {
  const float waveStrength = 0.02;
  const float scaleFactor = 100.0;
  //float noiseSeed1 = snoise(vec3(scaleFactor*vUv.x*0.02, scaleFactor*vUv.y*0.09, time*0.15));
  float noiseSeed2 = snoise(vec3(-scaleFactor*vUv.x*0.02, scaleFactor*vUv.y*0.09 + time * 0.2, time*0.15));
  float totalNoise = (noiseSeed2) * waveStrength;
  return totalNoise;
}

float calculateFresnel(in vec3 unitToCamera) {
  const float fresnelFactor = 1.75;
  // TODO: Replace hardcoded vec with water plane's normal
  float fresnelTerm = dot(unitToCamera, vec3(0.0, 1.0, 0.0));
  fresnelTerm = pow(fresnelTerm, fresnelFactor);
  return fresnelTerm;
}

void main() {
  //float noise = calculateSimplexNoise();

  // Old rippes with dudv map
  // Values are stored as positive in the map
  //vec2 noise_1 = (texture2D(dudvTexture, vec2(vUv.x + waterMoveFactor, vUv.y)).rg * 2.0 - 1.0) * waveStrength;
  //vec2 noise_2 = (texture2D(dudvTexture, vec2(-vUv.x, vUv.y + waterMoveFactor)).rg * 2.0 - 1.0) * waveStrength;
  //vec2 noise = noise_1 + noise_2;

  // DUDV
  vec2 noiseTexCoords = texture2D(dudvTexture, vec2(vUv.x + waterMoveFactor, vUv.y)).rg * 0.1;
  noiseTexCoords = vUv + vec2(noiseTexCoords.x, noiseTexCoords.y + waterMoveFactor);
  vec2 noise = (texture2D(dudvTexture, noiseTexCoords).rg * 2.0 - 1.0) * waveStrength;

  vec2 ndc = posClipSpace.xy / posClipSpace.w;
  vec2 screenCoords = ndc / 2.0 + 0.5;
  vec2 reflectionCoords = vec2(1.0 - screenCoords.x, screenCoords.y);
  vec2 refractionCoords = vec2(screenCoords.x, screenCoords.y);

  vec3 unitToCamera = normalize(toCamera);
  float fresnelTerm = calculateFresnel(unitToCamera);
  //vec3 specularHighlights = calculateSpecularHighlights(noise, unitToCamera);

  // Normal map
  vec4 normalMapColor = texture2D(normalMap, noiseTexCoords);
  vec3 normal = vec3(normalMapColor.r * 2.0 - 1.0, normalMapColor.b, normalMapColor.g * 2.0 - 1.0);
  normal = normalize(normal);

  // Lightning with normal map
  vec3 reflectedLight = reflect(normalize(fromLight), normal);
  float specular = max(dot(reflectedLight, unitToCamera), 0.0);
  specular = pow(specular, shineDamper);
  vec3 specularHighlights = vec3(1.0, 1.0, 1.0) * specular * reflectivity;

  gl_FragColor = mix(texture2D(reflectionTexture, reflectionCoords + noise),
                     texture2D(refractionTexture, refractionCoords + noise), fresnelTerm);
  gl_FragColor = mix(gl_FragColor, waterColor, 0.3) + vec4(specularHighlights, 0.0);
}
