varying vec2 vUv;

void main() {
    vUv = uv;

    vec4 posWorld = modelMatrix *
                vec4(position, 1.0);


    posWorld += snoise(vec3(posWorld.x, posWorld.y, 1.0));

    gl_Position = projectionMatrix * viewMatrix * posWorld;
}
