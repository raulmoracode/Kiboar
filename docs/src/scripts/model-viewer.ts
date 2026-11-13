import wasmUrl from 'occt-import-js/dist/occt-import-js.wasm?url';

function message(host: HTMLElement, text: string) {
  host.innerHTML = `<p class="flex h-full items-center justify-center px-4 text-center text-sm text-fd-muted-foreground">${text}</p>`;
}

class KiboarModel extends HTMLElement {
  private observer?: IntersectionObserver;
  private frame?: number;

  connectedCallback() {
    const url = this.getAttribute('url');
    if (!url) {
      message(this, 'No 3D model.');
      return;
    }
    message(this, 'Loading 3D model…');
    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      this.observer?.disconnect();
      void this.draw(url);
    });
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private async draw(url: string) {
    try {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const { default: occtimportjs } = await import('occt-import-js');

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = new Uint8Array(await response.arrayBuffer());
      const occt = await occtimportjs({ locateFile: () => wasmUrl });
      const result = occt.ReadStepFile(buffer, null);
      if (!result.success || !result.meshes?.length) throw new Error('empty model');

      const scene = new THREE.Scene();
      const group = new THREE.Group();
      let min = new THREE.Vector3(Infinity, Infinity, Infinity);
      let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

      for (const mesh of result.meshes) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(mesh.attributes.position.array, 3),
        );
        if (mesh.attributes.normal) {
          geometry.setAttribute(
            'normal',
            new THREE.Float32BufferAttribute(mesh.attributes.normal.array, 3),
          );
        } else {
          geometry.computeVertexNormals();
        }
        if (mesh.index) {
          geometry.setIndex(new THREE.Uint32BufferAttribute(mesh.index.array, 1));
        }
        geometry.computeBoundingBox();
        min = min.min(geometry.boundingBox!.min);
        max = max.max(geometry.boundingBox!.max);

        const color = mesh.color
          ? new THREE.Color(mesh.color[0], mesh.color[1], mesh.color[2])
          : new THREE.Color(0xb9bec7);
        const material = new THREE.MeshStandardMaterial({
          color,
          metalness: 0.15,
          roughness: 0.55,
          side: THREE.DoubleSide,
        });
        group.add(new THREE.Mesh(geometry, material));
      }

      group.rotation.x = -Math.PI / 2;
      const size = max.clone().sub(min);
      const center = max.clone().add(min).multiplyScalar(0.5);
      group.position.set(-center.x, -center.z, center.y);
      scene.add(group);

      const extent = Math.max(size.x, size.y, size.z) || 10;
      scene.add(new THREE.AmbientLight(0xffffff, 1.4));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(extent, extent * 1.5, extent);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.9);
      fill.position.set(-extent, -extent, -extent);
      scene.add(fill);

      const camera = new THREE.PerspectiveCamera(35, 1, extent / 1000, extent * 100);
      camera.position.set(extent * 1.1, extent * 0.9, extent * 1.3);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.replaceChildren(renderer.domElement);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.9;
      controls.enableZoom = true;

      const resize = () => {
        const width = this.clientWidth || 320;
        const height = this.clientHeight || 260;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(this);

      const animate = () => {
        this.frame = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
    } catch (error) {
      console.error('Kiboar model viewer:', error);
      message(this, 'The 3D model could not be loaded.');
    }
  }
}

if (!customElements.get('kiboar-model')) {
  customElements.define('kiboar-model', KiboarModel);
}
