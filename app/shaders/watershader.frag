uniform float time;
uniform float waterMoveFactor;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;

// Uniforms from GUI
uniform float waveStrength;
uniform float scatterConst;
uniform vec4 waterColor;
uniform float shineDamper;// = 20.0;
uniform float ks; //= 0.6;
uniform float kd;// = 0.0;
uniform float ka;// = 1.0;

varying vec2 vUv;
varying vec4 posClipSpace;
varying vec3 toCamera;
varying vec3 fromLight;

float calculateFresnel(in vec3 unitToCamera, in vec3 perturbedNormal) {
  // Old
  //const float fresnelFactor = 0.25;
  //float fresnelTerm = dot(unitToCamera, vec3(0.0, 1.0, 0.0));
  //fresnelTerm = pow(fresnelTerm, fresnelFactor);

  // Schick's approximation
  float theta1 = max(dot(unitToCamera, perturbedNormal), 0.0);
  float rf0 = 0.02;
  float fresnelTerm = rf0 + (1.0 - rf0)*pow((1.0 - theta1), 5.0);
  return fresnelTerm;
}

void calculateLightning(const vec3 surfaceNormal, const vec3 eyeDirection, float shiny,
              float spec, float diffuse, inout vec3 diffuseColor,
              inout vec3 specularColor){
    vec3 sunColor = vec3(1.0, 1.0, 1.0);
    vec3 unitFromLight = normalize(fromLight);
    vec3 reflection = normalize(reflect(unitFromLight, surfaceNormal));
    float direction = max(0.0, dot(eyeDirection, reflection));
    specularColor += pow(direction, shiny) * sunColor * spec;
    diffuseColor += max(dot(-unitFromLight, surfaceNormal), 0.0) * sunColor * diffuse;
}

void main() {
  float noiseX = snoise(vec3(vUv.x + time*0.1, vUv.y + time * 0.1, time * 0.1));
  float noiseY = snoise(vec3(vUv.x, vUv.y + time*0.1, 0.2));
  vec2 noise = waveStrength * vec2(noiseX, noiseY);

  vec2 ndc = posClipSpace.xy / posClipSpace.w;
  vec2 screenCoords = ndc / 2.0 + 0.5;
  vec2 reflectionCoords = vec2(1.0 - screenCoords.x, screenCoords.y);
  vec2 refractionCoords = vec2(screenCoords.x, screenCoords.y);

  vec3 perturbedNormal = normalize(vec3(noise.x, 0.4, noise.y));
  perturbedNormal = normalize(perturbedNormal);

  vec3 unitToCamera = normalize(toCamera);
  float fresnelTerm = calculateFresnel(unitToCamera, perturbedNormal);

  // New lightning
  vec3 diffuseColor = vec3(0.0);
  vec3 specularColor = vec3(0.0);
  calculateLightning(perturbedNormal, unitToCamera, shineDamper, ks, kd, diffuseColor, specularColor);

  vec4 refractionSample = texture2D(refractionTexture, refractionCoords + noise);
  gl_FragColor = mix(refractionSample,
                     texture2D(reflectionTexture, reflectionCoords + noise), fresnelTerm);

  vec4 waterColorFinal = mix(gl_FragColor, waterColor, 0.2);
  gl_FragColor = waterColorFinal * ka + waterColorFinal * vec4(diffuseColor, 1.0)
               + vec4(vec3(1.0, 1.0, 1.0), 1.0) * vec4(specularColor, 1.0);

}
