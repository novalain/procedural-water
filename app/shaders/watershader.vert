uniform vec3 cameraPositionWorld;
uniform vec3 lightPositionWorld;

varying vec4 posClipSpace;
varying vec2 vUv;
varying vec3 toCamera;
varying vec3 fromLight;

void main() {
  posClipSpace = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  toCamera = cameraPositionWorld - vec3(modelMatrix * vec4(position, 1.0));
  fromLight = vec3(modelMatrix * vec4(position, 1.0)) - lightPositionWorld;
  vUv = uv;
  gl_Position = posClipSpace;
}
