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

  // Create electrical circuit-like points
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const colors = [];

  const gridSize = 18;
  const spacing = 1.5;

  // Generate random 3D grid points
  for (let x = -gridSize; x <= gridSize; x += spacing) {
    for (let y = -gridSize; y <= gridSize; y += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        if (Math.random() > 0.5) {
          vertices.push(x, y, z);
          // Light gray color for points
          colors.push(1, 0.4, 0.871);
        }
      }
    }
  }

  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const pointMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 8,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, pointMaterial);
  scene.add(points);

  // Create connecting lines between nearby points
  const lineGeometry = new THREE.BufferGeometry();
  const lineVertices = [];
  const lineColors = [];

  for (let i = 0; i < vertices.length; i += 3) {
    for (let j = i + 3; j < vertices.length; j += 3) {
      const dx = vertices[i] - vertices[j];
      const dy = vertices[i + 1] - vertices[j + 1];
      const dz = vertices[i + 2] - vertices[j + 2];
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Only connect nearby points randomly
      if (distance < spacing * 1.5 && Math.random() > 0.8) {
        lineVertices.push(vertices[i], vertices[i + 1], vertices[i + 2]);
        lineVertices.push(vertices[j], vertices[j + 1], vertices[j + 2]);

        // Light yellow color for lines
        lineColors.push(0.816, 0.902, 0.573); // Yellow
        lineColors.push(0.816, 0.902, 0.573);
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
    opacity: 4,
    blending: THREE.AdditiveBlending,
  });

  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lines);

  // Animation
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);

    time += 0.001;

    // Slow rotation
    points.rotation.x = time * 0.3;
    points.rotation.y = time * 0.5;
    lines.rotation.x = time * 0.3;
    lines.rotation.y = time * 0.5;

    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize

  // Expose to window for Three.js DevTools
  window.threeScene = scene;
  window.threeCamera = camera;
  window.threeRenderer = renderer;
  window.threePoints = points;
  window.threeLines = lines;

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
    geometry.dispose();
    pointMaterial.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
  };
}
