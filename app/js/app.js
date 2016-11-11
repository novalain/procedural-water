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
    this.camera_ =
        new THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 1, 5000);

    this.camera_.position.set(0, 300, 500);
    this.camera_.lookAt(new THREE.Vector3(0,0,0));
    this.mirrorCamera_ =
        new THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 1, 5000);
    this.setupFlippedCamera(this.mirrorCamera_);

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
    this.camera_.aspect = this.WIDTH / this.HEIGHT;
    this.camera_.updateProjectionMatrix();
  }

  setupScene_(shaders) {
    this.scene_ = new THREE.Scene();
    this.shaders_ = shaders;
    //this.bufferScene = new THREE.Scene();
    this.bufferTexture = new THREE.WebGLRenderTarget(
        window.innerWidth, window.innerHeight,
        {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 1, 1).normalize();
    const geometry = new THREE.BoxGeometry(30, 30, 30);
    for (var i = 0; i < geometry.faces.length; i++) {
      geometry.faces[i].color.setHex(Math.random() * 0xffffff);
    }

    const sphereGeometry = new THREE.SphereGeometry(20, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial( {color:0xffff00 });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene_.add(sphereMesh);

    sphereMesh.position.x += 60;
    sphereMesh.position.y += 30;

    const torusGeometry = new THREE.TorusGeometry(15, 8, 8, 32);
    const torusMaterial = new THREE.MeshLambertMaterial({color: 'red'});
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    this.scene_.add(torusMesh);

    torusMesh.rotation.x = - Math.PI / 4;
    torusMesh.position.x -= 60;
    torusMesh.position.y += 30;

    const waterUniforms = {
      time: {value: 0},
      texture: {value: this.bufferTexture.texture}
    };

    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: this.shaders_['water_vert'],
      fragmentShader:
          this.shaders_['simplex_noise'] + this.shaders_['water_frag'],
      uniforms: waterUniforms,
      side: THREE.DoubleSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(200, 250, 1, 1);
    const waterMesh = new THREE.Mesh(planeGeometry, this.waterMaterial)
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      //specular: 0x555555,
      //shininess: 30,
      vertexColors: THREE.FaceColors,
    });

    /// TODO: Keep all scene objects that needs to be updated in a list
    this.cubeMesh = new THREE.Mesh(geometry, cubeMaterial);
    this.cubeMesh.position.y += 40;
    //waterMesh.position.y -= 50;
    waterMesh.rotation.x =  Math.PI/2;
    this.scene_.add(light);
    //this.bufferScene.add(this.cubeMesh);
    this.scene_.add(waterMesh);
    this.scene_.add(this.cubeMesh);
  }

  // TODO: Need to update this when implementing Orbit Controls
  setupFlippedCamera(flippedCamera) {
    const cameraCurrentWorld = this.camera_.getWorldDirection();
    flippedCamera.up.set(cameraCurrentWorld.x, -cameraCurrentWorld.y, cameraCurrentWorld.z);
    flippedCamera.position.set(
        this.camera_.position.x, -this.camera_.position.y, this.camera_.position.z);
    flippedCamera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  renderMirrorImage() {
    // Remove buffer texture from scene when it is rendered to
    this.waterMaterial.visible = false;
    this.renderer.render(this.scene_, this.mirrorCamera_, this.bufferTexture);
    this.waterMaterial.visible = true;
  }

  loop() {
    this.cubeMesh.rotation.x += 0.005;
    this.cubeMesh.rotation.y += 0.01;
    this.waterMaterial.uniforms.time.value += 0.05;

    this.renderMirrorImage();
    this.renderer.render(this.scene_, this.camera_);
    requestAnimationFrame(this.loop.bind(this));
  }
}
