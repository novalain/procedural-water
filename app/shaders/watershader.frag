varying vec2 vUv;
varying vec4 pos;

uniform float time;

void main() {
  float noise = snoise(0.005*vec4(pos.x*7.0, pos.y*40.0 + time * 100.0, pos.z * 10.0 + time * 10.0,time*80.0));
  gl_FragColor = vec4(99.0, 120.0, 173.0, 1.0) / 255.0 * noise;
}
