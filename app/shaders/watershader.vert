uniform vec3 cameraPositionWorld;

varying vec4 posClipSpace;
varying vec2 vUv;
varying vec3 toCamera;

void main() {
  posClipSpace = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  toCamera = cameraPositionWorld - vec3(modelMatrix * vec4(position, 1.0));
  vUv = uv;
  gl_Position = posClipSpace;
}
