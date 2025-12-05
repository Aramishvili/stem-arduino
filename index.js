// ? FIXME: Enhanced smooth scrolling with offset TODO:
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      // ! TODO: Adjust offset for fixed header height
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 20; // 20px offset

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    });
  });
});

function initElectricalBackground(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.appendChild(renderer.domElement);

  camera.position.z = 5;

  // Create polyhedron shapes in 3D space
  const polyhedronGeometry = new THREE.IcosahedronGeometry(0.15, 0);
  const polyhedronMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1, 0.984, 0), // Your pink/magenta color
    wireframe: true, // Solid filled shapes
    transparent: true,
    opacity: 8, // Slightly transparent for depth effect
  });

  const gridSize = 28;
  const spacing = 2.5;
  const polyhedrons = [];
  const vertices = [];

  // Generate random 3D grid of polyhedrons
  for (let x = -gridSize; x <= gridSize; x += spacing) {
    for (let y = -gridSize; y <= gridSize; y += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        if (Math.random() > 0.5) {
          const poly = new THREE.Mesh(polyhedronGeometry, polyhedronMaterial);
          poly.position.set(x, y, z);
          scene.add(poly);
          polyhedrons.push(poly);
          vertices.push(x, y, z);
        }
      }
    }
  }

  // Create a group to rotate all polyhedrons together
  const polyGroup = new THREE.Group();
  polyhedrons.forEach((poly) => {
    scene.remove(poly);
    polyGroup.add(poly);
  });
  scene.add(polyGroup);

  // Create connecting lines between nearby polyhedrons
  const lineGeometry = new THREE.BufferGeometry();
  const lineVertices = [];
  const lineColors = [];

  for (let i = 0; i < vertices.length; i += 3) {
    for (let j = i + 3; j < vertices.length; j += 3) {
      const dx = vertices[i] - vertices[j];
      const dy = vertices[i + 1] - vertices[j + 1];
      const dz = vertices[i + 2] - vertices[j + 2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Only connect nearby polyhedrons randomly
      if (distance < spacing * 1.5 && Math.random() > 0.8) {
        lineVertices.push(vertices[i], vertices[i + 1], vertices[i + 2]);
        lineVertices.push(vertices[j], vertices[j + 1], vertices[j + 2]);

        // Your light yellow-green color for lines
        lineColors.push(0.914, 0, 1);
        lineColors.push(0.914, 0, 1);
      }
    }
  }

  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(lineVertices, 3)
  );
  lineGeometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(lineColors, 3)
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 1.0, // Max opacity (was 4, clamped to 1)
    blending: THREE.AdditiveBlending,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);

    time += 0.001;

    // Slow rotation for both polyhedrons and lines
    polyGroup.rotation.x = time * 0.1;
    polyGroup.rotation.y = time * 0.2;
    lines.rotation.x = time * 0.1;
    lines.rotation.y = time * 0.2;

    // Individual polyhedron rotation for extra visual interest
    polyhedrons.forEach((poly) => {
      poly.rotation.x += 0.002;
      poly.rotation.y += 0.003;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Expose to window for Three.js DevTools and console tweaking
  window.threeScene = scene;
  window.threeCamera = camera;
  window.threeRenderer = renderer;
  window.threePolyhedrons = polyhedrons;
  window.threePolyGroup = polyGroup;
  window.threeLines = lines;

  // Handle window resize
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', onWindowResize);

  // Return cleanup function if needed
  return function cleanup() {
    window.removeEventListener('resize', onWindowResize);
    container.removeChild(renderer.domElement);
    polyhedronGeometry.dispose();
    polyhedronMaterial.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
  };
}
