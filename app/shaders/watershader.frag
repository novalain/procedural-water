uniform float time;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;

varying vec2 vUv;
varying vec4 posClipSpace;
varying vec3 toCamera;
varying vec3 fromLight;

const vec4 waterColor = vec4(0.0, 0.3, 0.5, 1.0);

// Phong specular term => Ks * (R dot V)^n
vec3 calculateSpecularHighlights(in float totalNoise, in vec3 unitToCamera) {
  const float shineDamper = 10.0;
  const float reflectivity = 1.6;
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
  float noise = calculateSimplexNoise();

  vec2 ndc = posClipSpace.xy / posClipSpace.w;
  vec2 screenCoords = ndc / 2.0 + 0.5;
  vec2 reflectionCoords = vec2(1.0 - screenCoords.x, screenCoords.y);
  vec2 refractionCoords = vec2(screenCoords.x, screenCoords.y);

  vec3 unitToCamera = normalize(toCamera);

  float fresnelTerm = calculateFresnel(unitToCamera);
  vec3 specularHighlights = calculateSpecularHighlights(noise, unitToCamera);

  gl_FragColor = mix(texture2D(reflectionTexture, reflectionCoords + noise),
                     texture2D(refractionTexture, refractionCoords + noise), fresnelTerm);
  gl_FragColor = mix(gl_FragColor, waterColor, 0.25) + vec4(specularHighlights, 0.0);
}
