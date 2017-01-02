
varying vec2 vUv;
varying float draw;
varying float elevation;
uniform float time;
uniform sampler2D myTexture;

float surface3( vec3 coord ) {

  float n = 0.0;

  n += 1.0 * abs( snoise( coord ) );
  n += 0.5 * abs( snoise( coord * 2.0 ) );
  n += 0.25 * abs( snoise( coord * 4.0 ) );
  n += 0.125 * abs( snoise( coord * 8.0 ) );

  return n;
}

void main() {

  vec3 coord = vec3( vUv, -0.0 );
  float n = surface3( coord );
 // gl_FragColor = vec4( vec3( n, n, n ), 1.0 );

  if(draw > 0.0) {
    vec4 grassy = (smoothstep(0.00, 0.46, elevation) )* vec4(31.0/255.0, 130.0 / 255.0, 0.0 / 255.0, 1.0);
    vec4 sandy = (smoothstep(0.46, 0.6, elevation) - smoothstep(0.28, 0.31, elevation)) *  vec4(88.0/255.0, 65.0/255.0, 36.0/255.0, 1.0);
    vec4 snowy = (smoothstep(0.8, 0.95, elevation)) * vec4(1.0, 1.0, 1.0, 1.0);
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + grassy + sandy + snowy;
  } else {
    // Get rid of weird plane under the water, ugly
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  //gl_FragColor = texture2D(myTexture, vUv);
}
/*
uniform sampler2D oceanTexture;
uniform sampler2D sandyTexture;
uniform sampler2D grassTexture;
uniform sampler2D rockyTexture;
uniform sampler2D snowyTexture;

varying vec2 vUV;

varying float vAmount;

void main()
{
  vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.24, 0.26, vAmount)) * texture2D( oceanTexture, vUV * 10.0 );
  vec4 sandy = (smoothstep(0.24, 0.27, vAmount) - smoothstep(0.28, 0.31, vAmount)) * texture2D( sandyTexture, vUV * 10.0 );
  vec4 grass = (smoothstep(0.28, 0.32, vAmount) - smoothstep(0.35, 0.40, vAmount)) * texture2D( grassTexture, vUV * 20.0 );
  vec4 rocky = (smoothstep(0.30, 0.50, vAmount) - smoothstep(0.40, 0.70, vAmount)) * texture2D( rockyTexture, vUV * 20.0 );
  vec4 snowy = (smoothstep(0.50, 0.65, vAmount))                                   * texture2D( snowyTexture, vUV * 10.0 );
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + water + sandy + grass + rocky + snowy; //, 1.0);
}  
*/
