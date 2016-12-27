uniform float time;
uniform float waterMoveFactor;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvTexture; // For noise
uniform sampler2D normalMap;
uniform sampler2D normalMap2;

// Uniforms from GUI
uniform float waveStrength;
uniform float scatterConst;
uniform vec4 waterColor;
uniform float shineDamper;// = 20.0;
uniform float ks; //= 0.6;
uniform float kd;// = 0.0;
uniform float ka;// = 1.0;

varying vec2 vUv;
varying vec2 vUvTiled;
varying vec4 posClipSpace;
varying vec3 toCamera;
varying vec3 fromLight;
varying vec3 worldPosition;
varying vec3 cameraPositionWorldOut;


//const vec3 waterColor = vec3(0.3, 0.5, 0.9);
//const float waveStrength = 0.02;

// Lightning


// Phong specular term => Ks * (R dot V)^n
// vec3 calculateSpecularHighlights(in float totalNoise, in vec3 unitToCamera) {
//   vec3 perturbedNormal = normalize(vec3(totalNoise, 0.002, totalNoise));
//   vec3 reflectedLight = reflect(normalize(fromLight), perturbedNormal);
//   float specular = max(dot(reflectedLight, unitToCamera), 0.0);
//   specular = pow(specular, shineDamper);
//   vec3 result = vec3(1.0, 1.0, 1.0) * specular * ks;
//   return result;
// }

float calculateSimplexNoise() {
  //const float waveStrength = 0.02;
  const float scaleFactor = 1.0;
  //float noiseSeed1 = snoise(vec3(scaleFactor*vUv.x*0.02, scaleFactor*vUv.y*0.09, time*0.15));
  //float noiseSeed2 = snoise(vec3(-scaleFactor*vUv.x*0.02, scaleFactor*vUv.y*0.09 + time * 0.2, time*0.15));

  float noiseSeed2 = scaleFactor * snoise(vec3(vUv.x + time*0.2, vUv.y + time * 0.2, 0.0));
  float noiseSeed1 = 0.0;//scaleFactor * snoise(vec3(vUv.x, vUv.y + time * 0.3, 0.0));

  //vec2 noiseTexCoords = texture2D(dudvTexture, vec2(vUv.x + waterMoveFactor, vUv.y)).rg * 0.1;
  //noiseTexCoords = vUv + vec2(noiseTexCoords.x, noiseTexCoords.y + waterMoveFactor);
  //vec2 noise = (texture2D(dudvTexture, noiseTexCoords).rg * 2.0 - 1.0) * waveStrength;

  float totalNoise = (noiseSeed2 + noiseSeed1) * waveStrength;
  return totalNoise;
}

float calculateFresnel(in vec3 unitToCamera, in vec3 perturbedNormal) {
  const float fresnelFactor = 1.75;
  // TODO: Replace hardcoded vec with water plane's normal
  //float fresnelTerm = dot(unitToCamera, vec3(0.0, 1.0, 0.0));
  //fresnelTerm = pow(fresnelTerm, fresnelFactor);
  // Shlicks approximation
  float theta1 = max(dot(unitToCamera, perturbedNormal), 0.0);
  float rf0 = 0.02;
  float fresnelTerm = rf0 + (1.0 - rf0)*pow((1.0 - theta1), 5.0);
  return fresnelTerm;
}

vec4 getNoise(vec2 uv, sampler2D tempTexture){
    vec2 uv0 = (uv/103.0)+vec2(time/17.0, time/29.0);
    vec2 uv1 = uv/107.0-vec2(time/-19.0, time/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/101.0, time/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/109.0, time/-113.0);
    vec4 noise = (texture2D(tempTexture, uv0)) +
                 (texture2D(tempTexture, uv1)) +
                 (texture2D(tempTexture, uv2)) +
                 (texture2D(tempTexture, uv3));
    return noise*0.5-1.0;
}

/*
vec2 getNormalNoise(vec2 uv){
    vec2 uv0 = (uv/103.0)+vec2(time/17.0, time/29.0);
    vec2 uv1 = uv/107.0-vec2(time/-19.0, time/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/101.0, time/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/109.0, time/-113.0);
    vec4 noise = (texture2D(normalMap, uv0)) +
                 (texture2D(normalMap, uv1)) +
                 (texture2D(normalMap, uv2)) +
                 (texture2D(normalMap, uv3));
    return noise*0.5-1.0;
}*/

vec2 getdudvNoise(vec2 uv){
    vec2 uv0 = (uv/103.0)+vec2(time/17.0, time/29.0);
    vec2 uv1 = uv/107.0-vec2(time/-19.0, time/31.0);
    vec2 uv2 = uv/vec2(897.0, 983.0)+vec2(time/101.0, time/97.0);
    vec2 uv3 = uv/vec2(991.0, 877.0)-vec2(time/109.0, time/-113.0);
    vec2 noise = (texture2D(dudvTexture, uv0).rg * 2.0 - 1.0) +
                 (texture2D(dudvTexture, uv1).rg * 2.0 - 1.0) +
                 (texture2D(dudvTexture, uv2).rg * 2.0 - 1.0) +
                 (texture2D(dudvTexture, uv3).rg * 2.0 - 1.0);
    return noise*0.5-1.0;
}

void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, float shiny,
              float spec, float diffuse, inout vec3 diffuseColor,
              inout vec3 specularColor){
    vec3 sunColor = vec3(1.0, 1.0, 1.0);
    //sunColor = normalize(sunColor);
    vec3 unitFromLight = normalize(fromLight);
    vec3 reflection = normalize(reflect(unitFromLight, surfaceNormal));
    float direction = max(0.0, dot(eyeDirection, reflection));
    specularColor += pow(direction, shiny)*sunColor*spec;
    diffuseColor += max(dot(-unitFromLight, surfaceNormal),0.0)*sunColor*diffuse;
}

void main() {
 // float noise_ = calculateSimplexNoise();


  float noiseX = snoise(vec3(vUv.x + time*0.2, vUv.y + time * 0.2, time * 0.2));
  float noiseY = snoise(vec3(vUv.x, vUv.y + time*0.2, 0.2));
  float noise_ = snoise(vec3(vUv.x + time*0.2, vUv.y + time * 0.2, time * 0.2));
//  vec2 noise = waveStrength * vec2(noiseX, noiseY);
  vec2 noise = waveStrength * vec2(noiseX, noiseY);


  // // Old rippes with dudv map
  // // Values are stored as positive in the map
  // vec2 noise_1 = (texture2D(dudvTexture, vec2(vUv.x + waterMoveFactor, vUv.y)).rg * 2.0 - 1.0) * waveStrength;
  // vec2 noise_2 = (texture2D(dudvTexture, vec2(-vUv.x, vUv.y + waterMoveFactor)).rg * 2.0 - 1.0) * waveStrength;
  // vec2 noise = noise_1 + noise_2;

  // DUDV
  //vec2 noiseTexCoords = texture2D(dudvTexture, vec2(vUv.x + waterMoveFactor, vUv.y)).rg * 0.1;
  //noiseTexCoords = vUv + vec2(noiseTexCoords.x, noiseTexCoords.y + waterMoveFactor);
  //vec2 noise = (texture2D(dudvTexture, noiseTexCoords).rg * 2.0 - 1.0) * waveStrength;

  vec2 ndc = posClipSpace.xy / posClipSpace.w;
  vec2 screenCoords = ndc / 2.0 + 0.5;
  vec2 reflectionCoords = vec2(1.0 - screenCoords.x, screenCoords.y);
  vec2 refractionCoords = vec2(screenCoords.x, screenCoords.y);

  // // Normal map
  vec4 normalMapColor = texture2D(normalMap, noise);
  //vec3 perturbedNormal = vec3(normalMapColor.r * 2.0 - 1.0, normalMapColor.b * 4.0, normalMapColor.g * 2.0 - 1.0);
  vec3 perturbedNormal = normalize(vec3(noise.x, 0.4, noise.y));
  perturbedNormal = normalize(perturbedNormal);

  //perturbedNormal = vec3(0.0, 1.0, 0.0);
  //gl_FragColor = normalMapColor;
  //return;

  vec3 unitToCamera = normalize(toCamera);
  float fresnelTerm = calculateFresnel(unitToCamera, perturbedNormal);
  //vec3 specularHighlights = calculateSpecularHighlights(noise, unitToCamera);

  // Lightning with normal map
  // vec3 unitFromLight = normalize(fromLight);
  // vec3 reflectedLight = reflect(normalize(unitFromLight), perturbedNormal);
  // float specular = max(dot(reflectedLight, unitToCamera), 0.0);
  // specular = pow(specular, shineDamper);
  // vec3 specularHighlights = vec3(1.0, 1.0, 1.0) * specular * reflectivity;

  // New lightning
  vec3 diffuseColor = vec3(0.0);
  vec3 specularColor = vec3(0.0);
  sunLight(perturbedNormal, unitToCamera, shineDamper, ks, kd, diffuseColor, specularColor);

  // Scatter
  vec3 scatter_tmp = max(0.0, dot(perturbedNormal, unitToCamera)) * vec3(0.0, 0.1, 0.07);
  vec4 scatter = vec4(scatter_tmp, 1.0) * scatterConst;

  //vec3 color = vec3(0.3, 0.5, 0.9);

  vec4 refractionSample = texture2D(refractionTexture, refractionCoords + noise);
  // float depth = length(worldPosition - cameraPositionWorldOut);
  // float waterDepth = min(refractionSample.a - depth, 40.0);
  // vec3 absorbtion = min((waterDepth/35.0)*vec3(2.0, 1.05, 1.0), vec3(1.0));
  // vec3 refractionColor = mix(vec3(refractionSample)*0.5, vec3(color), absorbtion);

  gl_FragColor = mix(refractionSample + scatter,
                     texture2D(reflectionTexture, reflectionCoords + noise), fresnelTerm);

  vec4 waterColorFinal = mix(gl_FragColor, waterColor, 0.3);
  gl_FragColor = waterColorFinal * ka + waterColorFinal * vec4(diffuseColor, 1.0) + vec4(vec3(1.0, 1.0, 1.0), 1.0) * vec4(specularColor, 1.0);


//  gl_FragColor = mix(gl_FragColor, waterColor, 0.3) + vec4(diffuse, 1.0) +  vec4(specularz, 1.0); //+ vec4(specularHighlights, 1.0);

  //vec3 colorLinear = ambientColor +
    //                 lambertian * diffuseColor +
      //               specular * specColor;

  // NEW

  // vec4 noise = getNoise(worldPosition.xz, normalMap); // or vUv?
  // // Let blue component be the y component in the normal vector, can be positive
  // // Convert x and z components to be [0,1] => [-1, 1]
  // vec3 perturbedSurfaceNormal = normalize((noise.xzy * vec3(2.0, 1.0, 2.0)));

  // vec3 diffuse = vec3(0.0);
  // vec3 specular = vec3(0.0);

  // vec3 worldToEye = toCamera;
  // vec3 eyeDirection = normalize(worldToEye);

  // sunLight(perturbedSurfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuse, specular);
  // vec4 dudvNoise = getNoise(worldPosition.xz, dudvTexture);
  // // Reflection
  // float dist = length(worldToEye);
  // //vec2 screen = (posClipSpace.xy / posClipSpace.z + 1.0) * 0.5;
  // vec2 ndc = posClipSpace.xy / posClipSpace.w;
  // vec2 screenCoords = ndc / 2.0 + 0.5;
  // vec2 reflectionCoords = vec2(1.0 - screenCoords.x, screenCoords.y);
  // vec2 refractionCoords = screenCoords.xy;
  // float distortionFactor = max(dist/100.0, 10.0);
  // vec2 distortion = dudvNoise.xy / distortionFactor; // Further away less noise

  // vec3 reflectionSample = vec3(texture2D(reflectionTexture, reflectionCoords + distortion));
  // vec3 refractionSample = vec3(texture2D(refractionTexture, refractionCoords - distortion));

  // // water color
  // vec3 color = vec3(0.3, 0.5, 0.5);

  // // Fresnel
  // float reflectance = calculateFresnel(eyeDirection, perturbedSurfaceNormal);

  // // Scattering
  // vec3 scatter = max(0.0, dot(perturbedSurfaceNormal, eyeDirection))*vec3(0.0, 0.1, 0.07) * 2.0;

  // // Absorbation
  // // float depth = length(worldPosition - toCamera);
  // // float waterDepth = min(vec4(refractionSample, 0.99).a - depth, 40.0);
  // // vec3 absorbtion = min((waterDepth/35.0)*vec3(2.0, 1.05, 1.0), vec3(1.0));
  // // vec3 refractionColor = mix(vec3(refractionSample)*0.5, color, absorbtion); 

  // vec3 albedo = mix((scatter+(color*refractionSample*diffuse + vec3(0.2)))*0.6, (vec3(0.1)+reflectionSample*0.9+specular), reflectance);
  // gl_FragColor = vec4(albedo, 1.0);//vec4(color * (reflectionSample+vec3(0.3)) * (diffuse + specular + 0.2) * 4.0, 1.0);
}
