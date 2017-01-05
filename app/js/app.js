'use strict'

class Application {
  constructor(container, shaders) {
    this.initStats_(container);
    this.initThreeJs_(container);
    this.initGUIVars();
    this.setupScene_(shaders);
    this.listen_();
  }

  initStats_(container) {
    this.stats_ = new Stats();
    container.appendChild(this.stats_.dom);
  }

  initGUIVars() {

    this.waveStrength = 0.02;
    this.scatterConst = 0.0;
    this.shineDamper = 20.0;
    this.ks = 0.6;
    this.kd = 0.1;
    this.ka = 1.0;

  }

  // TODO: Cleanup member variables
  initThreeJs_(container) {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.clock_ = new THREE.Clock();
    this.camera_ =
        new THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 1, 200000);
    this.camera_.position.set(0, 300, 500);
    this.camera_.lookAt(new THREE.Vector3(0, 0, 0));

    this.reflectionPlane_ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.refractionPlane_ = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    // TODO: How to remove clipping plane from Three.JS without lag?
    this.dummyPlane_ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 200000);

    this.renderer_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer_.setClearColor(0xffffff);
    this.renderer_.setSize(this.WIDTH, this.HEIGHT);
    container.appendChild(this.renderer_.domElement);

    this.controls_ = new THREE.OrbitControls(this.camera_, this.renderer_.domElement);
    this.controls_.minDistance = 10;
    this.controls_.maxDistance = 1000;
    this.controls_.update();
    //this.controls_.zoomSpeed = 10.0
  }

  listen_() { window.addEventListener('resize', this.onResize_.bind(this)); }

  onResize_(e) {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.renderer_.setSize(this.WIDTH, this.HEIGHT);
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
    const materialArray = urls.map(
        url => new THREE.MeshBasicMaterial(
            {map: textureLoader.load(url), side: THREE.BackSide}));
    const skyboxMaterial = new THREE.MeshFaceMaterial(materialArray);
    const skyboxGeom = new THREE.CubeGeometry(20000, 20000, 20000, 1, 1, 1);
    const skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
    this.scene_.add(skybox);
  }

  setupSkyDome_() {
    const textureLoader = new THREE.TextureLoader();
    const skyGeo = new THREE.SphereGeometry(15000, 25, 25);

    //skyGeo.scale.set(-1, 1, 1);
    //skyGeo.eulerOrder = 'XZY';
    //skyGeo.renderDepth = 1000.0;



    const texture = textureLoader.load("images/warped.jpg");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshBasicMaterial({
      map: texture, side:THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, material);

    //sky.scale.set(1, -1, 1);
    //sky.eulerOrder = 'ZYX';

    this.scene_.add(sky);
  }

  setupBottom_() {
    const textureLoader = new THREE.TextureLoader();
    const bottomGeometry = new THREE.PlaneGeometry(1000, 1000, 25, 25);
    const img = textureLoader.load('images/checkerboard.jpg');
   // const boximg = textureLoader.load('images/boxlol.jpg');
    //boximg.wrapS = boximg.wrapT = THREE.RepeatWrapping;
    img.wrapS = img.wrapT = THREE.RepeatWrapping;
    img.repeat.set(3, 3);
    const bottomMaterial =
        new THREE.MeshLambertMaterial({map: img, side: THREE.BackSide, wireframe: true});
    this.bottomUniforms_ = {
      time : {value : 0},
      textureMap : {value: img},
    //  myTexture: {value: boximg},
    };
    this.bottomMaterial_ = new THREE.ShaderMaterial({
      vertexShader: this.shaders_['simplex_noise'] + this.shaders_['bottom_vert'],
      fragmentShader:
          this.shaders_['simplex_noise'] + this.shaders_['bottom_frag'],
      uniforms: this.bottomUniforms_,
      //wireframe:true,
    });
    const bottomMesh = new THREE.Mesh(bottomGeometry, this.bottomMaterial_);
    bottomMesh.rotation.x = -Math.PI / 2;
    bottomMesh.position.y += 100;
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

  //  const light = new THREE.DirectionalLight(0xffffff);
   // light.position.set(0, 1, 1).normalize();

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(-600, 300, 600);

    const geometry = new THREE.BoxGeometry(30, 30, 30);
    for (var i = 0; i < geometry.faces.length; i++) {
      geometry.faces[i].color.setHex(Math.random() * 0xffffff);
    }

    const sphereGeometry = new THREE.SphereGeometry(20, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({color: 0xffff00});
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene_.add(sphereMesh);

    sphereMesh.position.x += 60;
    sphereMesh.position.y += 30;

    const torusGeometry = new THREE.TorusGeometry(15, 8, 8, 32);
    const torusMaterial = new THREE.MeshLambertMaterial({color: 'red'});
    const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    this.scene_.add(torusMesh);

    torusMesh.rotation.x = -Math.PI / 4;
    torusMesh.position.x -= 60;
    torusMesh.position.y += 30;

    this.waterUniforms = {
      time: {value: 0},
      waterMoveFactor: {value: 0.0},
      waveStrength: {value: this.waveStrength},
      waterColor: {value: new THREE.Vector3(0.0, 0.3, 0.5, 0.9)},
      scatterConst: {value: this.scatterConst},
      reflectionTexture: {value: this.reflectionRenderTarget.texture},
      refractionTexture: {value: this.refractionRenderTarget.texture},
      shineDamper: {value: this.shineDamper},
      ks: {value: this.ks},
      kd: {value: this.kd},
      ka: {value: this.ka},
      dudvTexture: {value: THREE.ImageUtils.loadTexture('images/waterDUDV.png')},
      normalMap: {value: THREE.ImageUtils.loadTexture('images/waterNormalMap.png')},
      normalMap2: {value: THREE.ImageUtils.loadTexture('images/waterNormalMap2.jpg')},
      // For Fresnel
      cameraPositionWorld: {value: this.camera_.position},
      lightPositionWorld: {value: light.position},
    };

    this.waterUniforms.dudvTexture.value.wrapS = this.waterUniforms.dudvTexture.value.wrapT = THREE.RepeatWrapping;
    this.waterUniforms.normalMap.value.wrapS = this.waterUniforms.normalMap.value.wrapT = THREE.RepeatWrapping;
    this.waterUniforms.normalMap2.value.wrapS = this.waterUniforms.normalMap2.value.wrapT = THREE.RepeatWrapping;

    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: this.shaders_['water_vert'],
      fragmentShader:
          this.shaders_['simplex_noise'] + this.shaders_['water_frag'],
      uniforms: this.waterUniforms,
      side: THREE.BackSide
    });

    const waterGeometry = new THREE.PlaneGeometry(600, 600, 1, 1);
    const waterMesh = new THREE.Mesh(waterGeometry, this.waterMaterial)
    waterMesh.rotation.x = Math.PI / 2;

    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x555555,
      shininess: 30,
      vertexColors: THREE.FaceColors,
    });
    this.cubeMesh = new THREE.Mesh(geometry, cubeMaterial);
    this.cubeMesh.position.y += 40;

    //this.setupSkybox_();
    //this.setupSkyDome_();
    this.setupBottom_();

    /// TODO: Keep all scene objects that needs to be updated in a list
    this.scene_.add(light);
    this.scene_.add(waterMesh);
    this.scene_.add(this.cubeMesh);
  }

  updateMirrorCamera_() {
    this.mirrorCamera_ = this.camera_.clone();
    const cameraUp =
        new THREE.Vector3(0, 1, 0).applyQuaternion(this.camera_.quaternion);
    this.mirrorCamera_.up.set(cameraUp.x, -cameraUp.y, cameraUp.z);
    this.mirrorCamera_.position.set(
        this.camera_.position.x, -this.camera_.position.y,
        this.camera_.position.z);
    this.mirrorCamera_.lookAt(this.camera_.getWorldDirection());
  }

  renderToMirrorTexture_() {
    this.renderer_.clippingPlanes = [this.reflectionPlane_];
    this.renderer_.render(
        this.scene_, this.mirrorCamera_, this.reflectionRenderTarget);
  }

  renderToRefractionTexture_() {
    this.renderer_.clippingPlanes = [this.refractionPlane_];
    this.renderer_.render(
        this.scene_, this.camera_, this.refractionRenderTarget);
  }

  updateScene_() {
    this.cubeMesh.rotation.x += 0.005;
    this.cubeMesh.rotation.y += 0.01;
    this.waterMaterial.uniforms.time.value += 0.05;
    this.bottomMaterial_.uniforms.time.value += 0.05;
    this.waterMaterial.uniforms.waterMoveFactor.value += 0.05 * this.clock_.getDelta();
   // if ( this.waterMaterial.uniforms.waterMoveFactor.value >= 1.0)
     // this.waterMaterial.uniforms.waterMoveFactor.value = 0.0;
    this.waterMaterial.uniforms.waterMoveFactor.value %= 1.0;
  }

  updateUniforms_() {
    this.waterMaterial.uniforms.waveStrength.value = this.waveStrength;
    this.waterMaterial.uniforms.scatterConst.value = this.scatterConst;
    this.waterMaterial.uniforms.shineDamper.value = this.shineDamper;
    this.waterMaterial.uniforms.ks.value = this.ks;
    this.waterMaterial.uniforms.kd.value = this.kd;
    this.waterMaterial.uniforms.ka.value = this.ka;
  }

  loop() {
    this.stats_.begin();
    this.controls_.update();

    this.updateScene_();
    this.updateUniforms_();
    this.updateMirrorCamera_();
    // Remove buffer texture from scene when it is rendered to
    this.waterMaterial.visible = false;
    this.renderToMirrorTexture_();
    this.renderToRefractionTexture_();
    this.waterMaterial.visible = true;
    this.renderer_.clippingPlanes = [this.dummyPlane_];
    this.renderer_.render(this.scene_, this.camera_);
    requestAnimationFrame(this.loop.bind(this));
    this.stats_.end();
  }
}
