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
    const light = new THREE.AmbientLight(0xff0000);
    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshBasicMaterial({color: 0x000000});

    this.scene = new THREE.Scene();
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(light);
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

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop.bind(this));
  }
}
