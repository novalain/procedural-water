uniform vec3 cameraPositionWorld;
uniform vec3 lightPositionWorld;

varying vec4 posClipSpace;
varying vec2 vUv;
varying vec2 vUvTiled;
varying vec3 toCamera;
varying vec3 fromLight;
varying vec3 cameraPositionWorldOut;

varying vec3 worldPosition;

void main() {
  vec3 posWorld = vec3(modelMatrix * vec4(position, 1.0));
  worldPosition = posWorld;
  posClipSpace = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  toCamera = cameraPositionWorld - posWorld;
  fromLight = normalize(posWorld - lightPositionWorld);
  vUv = uv * 420.0;
  //vUv = vec2(position.x / 2.0 + 0.5, position.y / 2.0 + 0.5);
  cameraPositionWorldOut = cameraPositionWorld;
  gl_Position = posClipSpace;
}
