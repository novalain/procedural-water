varying vec4 pos;
varying vec2 vUv;

void main() {
  pos = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  vUv = uv;
  gl_Position = pos;
}
