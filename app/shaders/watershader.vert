uniform vec3 cameraPositionWorld;
uniform vec3 lightPositionWorld;

varying vec4 posClipSpace;
varying vec2 vUv;
varying vec2 vUvManual;
varying vec2 vUvTiled;
varying vec3 toCamera;
varying vec3 fromLight;

void main() {
  vec3 posWorld = vec3(modelMatrix * vec4(position, 1.0));

  posClipSpace = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  toCamera = cameraPositionWorld - posWorld;
  fromLight = posWorld - lightPositionWorld;
  vUv = uv * 6.0;
  //vUv = vec2(position.x / 2.0 + 0.5, position.y / 2.0 + 0.5);
  gl_Position = posClipSpace;
}
