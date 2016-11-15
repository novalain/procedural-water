varying vec2 vUv;
varying vec4 pos;

uniform float time;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;

const float waveStrength = 0.01;

void main() {

  float factor = 100.0;
  float noiseSeed1 = snoise(vec3(factor*vUv.x*0.01, factor*vUv.y*0.05, time*0.15));
  float noiseSeed2 = snoise(vec3(-factor*vUv.x*0.01, factor*vUv.y*0.05 + time * 0.2, time*0.15));

  float totalNoise = (noiseSeed1 + noiseSeed2) * waveStrength;

  //gl_FragColor = vec4(99.0, 120.0, 173.0, 1.0) / 255.0 * noise;
  vec4 waterColor = vec4(99.0, 120.0, 173.0, 1.0) / 255.0;
  vec2 ndc = pos.xy / pos.w;
  vec2 screenCoords = ndc / 2.0 + 0.5;
  vec2 reflectionCoords = vec2(1.0 - screenCoords.x, screenCoords.y);
  vec2 refractionCoords = vec2(screenCoords.x, screenCoords.y);

  gl_FragColor = mix(texture2D(refractionTexture, refractionCoords + totalNoise),
  					 texture2D(reflectionTexture, reflectionCoords + totalNoise), 0.4);
  gl_FragColor = mix(gl_FragColor, vec4(0.0, 0.3, 0.5, 1.0), 0.15);
}
