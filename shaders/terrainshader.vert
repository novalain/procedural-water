uniform float nSeedTerrain;
uniform float nStrengthTerrain1;
uniform float nStrengthTerrain2;
uniform vec3 cameraPositionWorld;
uniform vec3 lightPositionWorld;

varying float elevation;
varying vec2 vUv;
varying vec3 toCamera;
varying vec3 fromLight;
varying vec3 perturbedNormal;

void main() {
  vUv = vec2(position);
  vec4 tmp_pos = modelMatrix * vec4(position,1.0);

  toCamera = cameraPositionWorld - vec3(tmp_pos);
  fromLight = normalize(vec3(tmp_pos) - lightPositionWorld);

  vec3 gradTmp = vec3(0.0);
  vec3 grad = vec3(0.0);
  float noise = 0.25  * snoise(vec3(0.05*position.x, 0.05*position.y, nSeedTerrain), gradTmp);
  grad += gradTmp;
  noise += 0.125 * snoise(vec3(0.1*position.x, 0.1* position.y, nSeedTerrain), gradTmp);
  grad += gradTmp;
  noise += 0.075 * snoise(vec3(0.2*position.x, 0.2* position.y, nSeedTerrain), gradTmp);
  grad += gradTmp;

  vec3 realNormal = vec3(0.0, 1.0, 0.0);
  vec3 gradProj = dot(realNormal, grad) * realNormal;
  vec3 gradOrt = grad - gradProj;
  vec3 newNormal = realNormal - 0.02*gradOrt;

  perturbedNormal = newNormal;//normalize(vec3(0.0, -1.0, 0.0));

  // Gauss 2D function
  tmp_pos.y = 50.0 + nStrengthTerrain1 * noise + -200.0*
            exp(-((pow((tmp_pos.x - 0.0), 2.0) / (2.0 * pow(180.0 + nStrengthTerrain2*noise, 2.0)) ) +
            (pow((tmp_pos.z - 0.0), 2.0) / (2.0 * pow(180.0 + nStrengthTerrain2*noise, 2.0)))));

  // Center hill
  tmp_pos.y += -10.0 + 200.0*
            exp(-((pow((tmp_pos.x - 0.0), 2.0) / (2.0 * pow(100.0 + 0.0*noise , 2.0)) ) +
            (pow((tmp_pos.z - 0.0), 2.0) / (2.0 * pow(100.0 + 0.0*noise , 2.0)))));

  elevation = tmp_pos.y;
  gl_Position = projectionMatrix * viewMatrix * tmp_pos;
}
