//varying vec2 vUv;
varying vec4 pos;

uniform float time;
uniform sampler2D texture;

void main() {
  float noise = snoise(0.001*vec3(pos.x*7.0, pos.y*50.0 + 5.0*time * 100.0,time*100.0));
  //gl_FragColor = vec4(99.0, 120.0, 173.0, 1.0) / 255.0 * noise;
  vec4 waterColor = vec4(99.0, 120.0, 173.0, 1.0) / 255.0;
  vec2 ndc = pos.xy / pos.w;
  vec2 screen = ndc / 2.0 + 0.5;
  vec2 final = vec2( 1.0 - screen.x, screen.y);
  //vec2 texcoord = vec2(1.0 - vUv.x, 1.0 - vUv.y);
  //gl_FragColor = 0.5*texture2D(texture,  - (screen + vec2(noise, noise) * 0.01)) + noise * waterColor * 2.0;
  gl_FragColor = texture2D(texture, final);
}
