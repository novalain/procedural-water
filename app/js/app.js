'use strict'

class Application {
  constructor(container, shaders) {
    this.initThreeJs_(container);
    this.setupScene_(shaders);
    this.listen_();
  }

  // TODO: Cleanup member variables
  initThreeJs_(container) {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.container = container;
    this.camera =
        new THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 1, 5000);
    this.camera.position.set(0, 0, 500);
    this.renderer = new THREE.WebGLRenderer({
    //  alpha: true,
      antialias: true,
    });
    //this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.container.appendChild(this.renderer.domElement);
    this.time = 0;
  }

  listen_() {
    window.addEventListener('resize', this.onResize_.bind(this))
  }

  onResize_(e) {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix();
  }

  setupScene_(shaders) {
    this.scene_ = new THREE.Scene();
    this.shaders_ = shaders;
    //this.bufferScene = new THREE.Scene();
    //this.bufferTexture = new THREE.WebGLRenderTarget(
    //    window.innerWidth, window.innerHeight,
    //    {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 1, 1).normalize();
    const geometry = new THREE.BoxGeometry(100, 100, 100);

    this.waterUniforms = { time: { value: 0 } };
    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: this.shaders_['water_vert'],
      fragmentShader:
          this.shaders_['simplex_noise'] + this.shaders_['water_frag'],
      uniforms: this.waterUniforms,
      side: THREE.DoubleSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(400, 400, 1, 1);
    const waterMesh = new THREE.Mesh(planeGeometry, waterMaterial)
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x0033ff,
      specular: 0x555555,
      shininess: 30,
    });

    /// TODO: Keep all scene objects that needs to be updated in a list
    this.cubeMesh = new THREE.Mesh(geometry, cubeMaterial);
    this.cubeMesh.position.y += 80;
    waterMesh.position.y -= 50;
    waterMesh.rotation.x =  Math.PI*3/4;
    this.scene_.add(light);
    //this.bufferScene.add(this.cubeMesh);
    this.scene_.add(waterMesh);
    this.scene_.add(this.cubeMesh);
  }

  loop() {
    this.cubeMesh.rotation.x += 0.005;
    this.cubeMesh.rotation.y += 0.01;
    this.waterUniforms.time.value += 0.05;

    //this.renderer.render(this.bufferScene, this.camera, this.bufferTexture);
    this.renderer.render(this.scene_, this.camera);
    requestAnimationFrame(this.loop.bind(this));
  }
}
