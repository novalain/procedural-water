uniform float nSeedTerrain;

varying float elevation;
varying vec2 vUv;

void main() {
  vUv = vec2(position);
  vec4 tmp_pos = modelMatrix * vec4(position,1.0);

  float noise = 0.25 * snoise(vec3(0.05*position.x, 0.05*position.y, nSeedTerrain))  +
                0.125* snoise(vec3(0.1*position.x, 0.1* position.y, nSeedTerrain)) +
                0.075 * snoise(vec3(0.2*position.x, 0.2* position.y, nSeedTerrain));

  // Gauss 2D function
  tmp_pos.y = 50.0 + 20.0 * noise + -200.0*
            exp(-((pow((tmp_pos.x - 0.0), 2.0) / (2.0 * pow(180.0 + 0.0*noise, 2.0)) ) +
            (pow((tmp_pos.z - 0.0), 2.0) / (2.0 * pow(180.0 + 100.0*noise, 2.0)))));

  tmp_pos.y += -10.0 + 200.0*
            exp(-((pow((tmp_pos.x - 0.0), 2.0) / (2.0 * pow(100.0 + 0.0*noise , 2.0)) ) +
            (pow((tmp_pos.z - 0.0), 2.0) / (2.0 * pow(100.0 + 0.0*noise , 2.0)))));

  elevation = tmp_pos.y;
  gl_Position = projectionMatrix * viewMatrix * tmp_pos;
}
