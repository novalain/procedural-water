'use strict'

class Application {
  constructor(container) {
    this.initThreeJs_(container);
    this.setupScene_();
    window.addEventListener('resize', this.onResize_.bind(this))
  }

  initThreeJs_(container) {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.container = container;
    this.camera = new THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 1, 5000);
    this.camera.position.set(0, 0, 500);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.container.appendChild(this.renderer.domElement);
  }

  setupScene_() {
    this.scene = new THREE.Scene();
    //this.bufferScene = new THREE.Scene();
    //this.bufferTexture = new THREE.WebGLRenderTarget(
    //    window.innerWidth, window.innerHeight,
    //    {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 1, 1).normalize();
    const geometry = new THREE.BoxGeometry(100, 100, 100);

    //const waterMaterial = new THREE.MeshBasicMaterial(
    //    {color: 0x26ff26, side: THREE.Backside, wireframe: true});
    const waterMaterial = new THREE.ShaderMaterial({
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      wireframe:true,
    });
    const planeGeometry = new THREE.PlaneGeometry(400, 400, 1, 1);
    const waterMesh = new THREE.Mesh(planeGeometry, waterMaterial);
    //const geometry = new THREE.PlaneGeometry(150, 300, 50);
    //const material = new THREE.MeshBasicMaterial({color: 0x000000});
    const material = new THREE.MeshPhongMaterial({
      color: 0x0033ff,
      specular: 0x555555,
      shininess: 30,
    });

    //var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('js/crate.jpg') } );
    //const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    this.mesh = new THREE.Mesh(geometry, waterMaterial);
    this.mesh.position.y += 80;
    waterMesh.position.y -= 50;
    waterMesh.rotation.x =  Math.PI*3/4;
    this.scene.add(light);
    //this.bufferScene.add(this.mesh);
    this.scene.add(waterMesh);
    this.scene.add(this.mesh);

  }

  onResize_(e) {
    this.WIDTH = window.innerWidth;
    this.HEIGHT = window.innerHeight;
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix();
  }

  loop() {
    this.mesh.rotation.x += 0.005;
    this.mesh.rotation.y += 0.01;

    //this.mainBoxObject.rotation.x += 0.005;
    //this.mainBoxObject.rotation.y += 0.01;

    //this.renderer.render(this.bufferScene, this.camera, this.bufferTexture);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop.bind(this));
  }
}
