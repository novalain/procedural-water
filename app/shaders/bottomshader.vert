/*varying vec2 vUv;
varying vec3 pos;

void main() {
    vUv = 7.0 * uv + 600.0;

    vec4 posWorld = modelMatrix *
                vec4(position, 1.0);

    pos = position;

    posWorld += snoise(vec3(posWorld.x, posWorld.y, 1.0));

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
*/


//uniform sampler2D bumpTexture;
//uniform float bumpScale;

varying float elevation;
varying vec2 vUv;
varying float draw;

void main()  {

  float bumpScale = 300.0;

  const float seed = 3.00;
  //float freq = 40.0;

  //vUv *= 3.0;
  //vec4 bumpData = texture2D( bumpTexture, uv );
  //vAmount = bumpData.r; // assuming map is grayscale it doesn't matter if you use r, g, or b.
  //vAmount = snoise(vec3(vUv , 1.0));

  vUv = uv;
  //elevation = snoise(vec3(freq * vUv, 1.0));

  elevation =  1.0 * abs(snoise(vec3(1.0*vUv, seed)))
             + 0.5 * abs(snoise(vec3(2.0*vUv, seed)))
             + 0.25 * abs(snoise(vec3(4.0 * vUv, seed)));


 // elevation = pow(elevation, 1.2);

 // float d = 2.0*max(abs(vUv.x), abs(vUv.y));
 // euclidian
  //float d = 2.0*sqrt(vUv.x * vUv.x + vUv.y * vUv.y);
  //elevation = (elevation + 0.1) * (1.0 - 1.00 * pow(d, 2.00));

  // move the position along the normal
  vec4 posWorld = modelMatrix * vec4(position, 1.0);
 // posout = posWorld;//(projectionMatrix * viewMatrix * posWorld);


  vec3 newPosition;
  if(length(posWorld - vec4(0.0, 0.0, 0.0, 0.0)) < 250.0) {
  //if (posWorld.x < 250.0 && posWorld.x > -250.0 && posWorld.z < 250.0 && posWorld.z > -250.0) {
    newPosition = position + normal * bumpScale * elevation;
  } else {
    newPosition = position;
  }

  if (newPosition.z > 0.0) {
    draw = 1.0;
  } else {
    draw = 0.0;
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
