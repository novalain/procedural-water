'use strict'

// TODO: ShaderManager
const shaderPaths = new Map([['water_vert', 'shaders/watershader.vert'],
                            ['water_frag', 'shaders/watershader.frag'],
                            ['simplex_noise', 'shaders/Noise4D.glsl']]);
const shadersLoaded = new Map();

window.onload = () => {
  const shaderPromises = [];
  shaderPaths.forEach((path, key) => {
    const promise = ShaderFetcher.fetchShader(path).then(rawShader => {
      shadersLoaded[key] = rawShader;
    });
    shaderPromises.push(promise);
  });

  Promise.all(shaderPromises).then(() => {
    const app = new Application(document.body, shadersLoaded);
    app.loop();
  });
}
