//varying vec2 vUv;
varying vec4 pos;

uniform float time;
uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;

void main() {
  float noise = snoise(0.001*vec3(pos.x*7.0, pos.y*50.0 + 5.0*time * 80.0,time*100.0));
  //gl_FragColor = vec4(99.0, 120.0, 173.0, 1.0) / 255.0 * noise;
  vec4 waterColor = vec4(99.0, 120.0, 173.0, 1.0) / 255.0;
  vec2 ndc = pos.xy / pos.w;
  vec2 screenCoords = ndc / 2.0 + 0.5;
  vec2 reflectionCoords = vec2(1.0 - screenCoords.x, screenCoords.y);
  vec2 refractionCoords = vec2(screenCoords.x, screenCoords.y);
  gl_FragColor = mix(texture2D(refractionTexture, refractionCoords + vec2(noise, noise) * 0.01),
  					 texture2D(reflectionTexture, reflectionCoords + vec2(noise, noise) * 0.01), 0.5) + noise * 0.1;
}
