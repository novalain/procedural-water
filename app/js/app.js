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
        new THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 1, 20000);
    this.camera_.position.set(0, 300, 500);
    this.camera_.lookAt(new THREE.Vector3(0,0,0));

    this.reflectionPlane_ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.refractionPlane_ = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    // TODO: How to remove clipping plane from Three.JS without lag?
    this.dummyPlane_ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 5000);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera_);
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

  setupSkybox_() {
    const textureLoader = new THREE.TextureLoader();
    const urls = [
      'images/dawnmountain-xpos.png', 'images/dawnmountain-xneg.png',
      'images/dawnmountain-ypos.png', 'images/dawnmountain-yneg.png',
      'images/dawnmountain-zpos.png', 'images/dawnmountain-zneg.png'
    ];
    const materialArray = urls.map(url => new THREE.MeshBasicMaterial(
        {map: textureLoader.load(url), side: THREE.BackSide}));
    const skyboxMaterial = new THREE.MeshFaceMaterial(materialArray);
    const skyboxGeom = new THREE.CubeGeometry(1000, 1000, 1000, 1, 1, 1);
    const skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
    this.scene_.add(skybox);
  }

  setupSkyDome_() {
    const textureLoader = new THREE.TextureLoader();
    const skyGeo = new THREE.SphereGeometry(5000, 25, 25);
    const texture = textureLoader.load("images/warped.jpg");
    const material = new THREE.MeshPhongMaterial({
      map: texture, side:THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, material);
    this.scene_.add(sky);
  }

  setupBottom_() {
    const textureLoader = new THREE.TextureLoader();
    const planeGeometry = new THREE.PlaneGeometry(200, 250, 1, 1);
    const img = textureLoader.load('images/checkerboard.jpg');
    img.wrapS = img.wrapT = THREE.RepeatWrapping;
    img.repeat.set(3, 3);
    const bottomMaterial = new THREE.MeshLambertMaterial({
      map: img,
      side: THREE.BackSide
    });
    const bottomMesh = new THREE.Mesh(planeGeometry, bottomMaterial);
    bottomMesh.rotation.x = Math.PI/2;
    bottomMesh.position.y -= 30;
    this.scene_.add(bottomMesh);
  }

  setupScene_(shaders) {
    this.scene_ = new THREE.Scene();
    this.shaders_ = shaders;
    this.reflectionRenderTarget = new THREE.WebGLRenderTarget(
        window.innerWidth, window.innerHeight,
        {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
    this.refractionRenderTarget = new THREE.WebGLRenderTarget(
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
      reflectionTexture: {value: this.reflectionRenderTarget.texture},
      refractionTexture: {value: this.refractionRenderTarget.texture},
      // For Fresnel
      cameraPositionWorld: {value: this.camera_.position},
    };

    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: this.shaders_['water_vert'],
      fragmentShader:
          this.shaders_['simplex_noise'] + this.shaders_['water_frag'],
      uniforms: waterUniforms,
      side: THREE.BackSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(200, 250, 1, 1);
    const waterMesh = new THREE.Mesh(planeGeometry, this.waterMaterial)
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x555555,
      shininess: 30,
      vertexColors: THREE.FaceColors,
    });

    this.setupSkybox_();
    this.setupBottom_();

    /// TODO: Keep all scene objects that needs to be updated in a list
    this.cubeMesh = new THREE.Mesh(geometry, cubeMaterial);
    this.cubeMesh.position.y += 40;
    //waterMesh.position.y -= 50;
    waterMesh.rotation.x =  Math.PI/2;
    this.scene_.add(light);
    this.scene_.add(waterMesh);
    this.scene_.add(this.cubeMesh);
  }

  updateFlippedCamera() {
    this.mirrorCamera_ = this.camera_.clone();
    const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera_.quaternion);
    this.mirrorCamera_.up.set(cameraUp.x, -cameraUp.y, cameraUp.z);
    this.mirrorCamera_.position.set(
        this.camera_.position.x, -this.camera_.position.y, this.camera_.position.z);
    this.mirrorCamera_.lookAt(this.camera_.getWorldDirection());
  }

  renderMirrorImage() {
    this.renderer.clippingPlanes = [this.reflectionPlane_];
    this.renderer.render(this.scene_, this.mirrorCamera_, this.reflectionRenderTarget);
  }

  renderRefractionImage() {
    this.renderer.clippingPlanes = [this.refractionPlane_];
    this.renderer.render(this.scene_, this.camera_, this.refractionRenderTarget);
  }

  loop() {
    this.cubeMesh.rotation.x += 0.005;
    this.cubeMesh.rotation.y += 0.01;
    this.waterMaterial.uniforms.time.value += 0.05;

    this.updateFlippedCamera();
    this.controls.update();

     // Remove buffer texture from scene when it is rendered to
    this.waterMaterial.visible = false;
    this.renderMirrorImage();
    this.renderRefractionImage();
    this.waterMaterial.visible = true;
    this.renderer.clippingPlanes = [this.dummyPlane_];
    this.renderer.render(this.scene_, this.camera_);
    requestAnimationFrame(this.loop.bind(this));
  }
}
