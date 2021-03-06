'use strict'

// TODO: ShaderManager
const shaderPaths = new Map([['water_vert', 'shaders/watershader.vert'],
                            ['water_frag', 'shaders/watershader.frag'],
                            ['terrain_vert', 'shaders/terrainshader.vert'],
                            ['terrain_frag', 'shaders/terrainshader.frag'],
                            ['simplex_noise', 'shaders/Noise3D.glsl']]);
const shadersLoaded = new Map();

window.onload = () => {
  const shaderPromises = [];
  shaderPaths.forEach((path, key) => {
    const promise = ShaderFetcher.fetchShader(path).then(
        rawShader => { shadersLoaded[key] = rawShader; });
    shaderPromises.push(promise);
  });

  // Wait for shaders to fetch and start app
  Promise.all(shaderPromises).then(() => {
    var gui = new dat.GUI();
    const app = new Application(document.body, shadersLoaded);
    gui.add(app, 'waveStrength', 0, 0.1);
    gui.add(app, 'shineDamper', 0.0, 40.0);
    gui.add(app, 'ks', 0.0, 1.0);
    gui.add(app, 'kd', 0.0, 1.0);
    gui.add(app, 'ka', 0.0, 1.0);
    gui.add(app, 'nSeedTerrain', 1.0, 5.0);
    gui.add(app, 'nStrengthTerrain1', 0.0, 500.0);
    gui.add(app, 'nStrengthTerrain2', 0.0, 500.0);
    app.loop();
  });
}
