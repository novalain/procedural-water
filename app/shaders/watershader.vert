uniform vec3 cameraPositionWorld;
uniform vec3 lightPositionWorld;

varying vec4 posClipSpace;
varying vec2 vUv;
varying vec3 toCamera;
varying vec3 fromLight;

void main() {
  vec3 posWorld = vec3(modelMatrix * vec4(position, 1.0));
  toCamera = cameraPositionWorld - posWorld;
  fromLight = normalize(posWorld - lightPositionWorld);
  vUv = uv * 42.0 / 5.0;
  posClipSpace = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  gl_Position = posClipSpace;
}
