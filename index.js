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

// Rotate Arduino Image on Scroll

window.addEventListener('scroll', () => {
  const img = document.getElementById('arduino');
  const scrollY = window.scrollY;
  // Directly map scroll position to rotation
  img.style.transform = `rotate(${scrollY}deg)`;
});

// Position micro image 600px from top of footer
function positionMicroImage() {
  const micro = document.getElementById('micro');
  const footer = document.querySelector('footer');

  if (micro && footer) {
    const footerTop = footer.offsetTop;
    const microTop = footerTop - 600;
    micro.style.top = `${microTop}px`;
    micro.style.visibility = 'visible';
  }
}

// Call on load and resize
window.addEventListener('load', positionMicroImage);
window.addEventListener('resize', positionMicroImage);

// THREE.js Electric Spark Animation Along Zigzag Path

const canvas = document.getElementById('spark-canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  0,
  200,
  0,
  -window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(600, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 100;

// Create zigzag line from top to bottom
const createZigzagLine = () => {
  const nav = document.querySelector('nav');
  const footer = document.querySelector('footer');

  // Calculate start position (200px below nav bar)
  const startY = nav ? nav.offsetTop + nav.offsetHeight + 200 : 100;

  // Calculate end position (200px above footer)
  const endY = footer
    ? footer.offsetTop - 500
    : document.documentElement.scrollHeight - 400;

  const lineHeight = endY - startY;
  const zigzagWidth = 60; // Width of zigzag pattern
  const segmentHeight = 100; // Distance between zigzag points (fewer zigzags)
  const baseX = 40; // Position off the left edge

  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = [];

  const numSegments = Math.ceil(lineHeight / segmentHeight) - 1;

  for (let i = 0; i <= numSegments; i++) {
    const y = -(startY + i * segmentHeight);
    // Create straight zigzag by alternating left/right
    const zigzag = i % 2 === 0 ? 0 : zigzagWidth;
    linePositions.push(baseX + zigzag, y, 0);
  }

  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(linePositions, 3)
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x0095d6,
    transparent: false,
    opacity: 1,
    linewidth: 18,
  });

  return new THREE.Line(lineGeometry, lineMaterial);
};

let zigzagLine = createZigzagLine();
scene.add(zigzagLine);

// Get position along zigzag path
function getZigzagPosition(scrollPosition) {
  const nav = document.querySelector('nav');
  const footer = document.querySelector('footer');

  const startY = nav ? nav.offsetTop + nav.offsetHeight + 200 : 100;
  const endY = footer
    ? footer.offsetTop - 500
    : document.documentElement.scrollHeight - 400;
  const lineHeight = endY - startY;

  const zigzagWidth = 60;
  const segmentHeight = 100;
  const baseX = 40;

  // Calculate the actual line length including the extra segment
  const numSegments = Math.ceil(lineHeight / segmentHeight) - 1;
  const actualLineLength = numSegments * segmentHeight;

  // Calculate scroll progress (0 to 1)
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollProgress = maxScroll > 0 ? scrollPosition / maxScroll : 0;

  // Map scroll progress to actual line position
  const lineProgress = startY + scrollProgress * actualLineLength;
  const y = -lineProgress;

  // Calculate which segment we're in and interpolate
  const segmentIndex = (lineProgress - startY) / segmentHeight;
  const segmentProgress = segmentIndex % 1;
  const currentSegment = Math.floor(segmentIndex);

  // Alternate between left and right
  const startX = currentSegment % 2 === 0 ? 0 : zigzagWidth;
  const endX = currentSegment % 2 === 0 ? zigzagWidth : 0;
  const zigzag = startX + (endX - startX) * segmentProgress;

  const x = baseX + zigzag;

  return { x, y };
}

// Create electric spark particles
const sparkCount = 100;
const sparkGeometry = new THREE.BufferGeometry();
const sparkPositions = new Float32Array(sparkCount * 7);
const sparkColors = new Float32Array(sparkCount * 3);

for (let i = 0; i < sparkCount; i++) {
  sparkPositions[i * 3] = 20;
  sparkPositions[i * 3 + 1] = 0;
  sparkPositions[i * 3 + 2] = 0;
  // Red color
  sparkColors[i * 3] = 1.0;
  sparkColors[i * 3 + 1] = 0.0;
  sparkColors[i * 3 + 2] = 0.0;
}

sparkGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(sparkPositions, 3)
);
sparkGeometry.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

const sparkMaterial = new THREE.PointsMaterial({
  size: 0.5,
  transparent: false,
  opacity: 1,
  vertexColors: true,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true,
});

const sparkParticles = new THREE.Points(sparkGeometry, sparkMaterial);
scene.add(sparkParticles);

// Create glow effect
const glowCount = 2;
const glowGeometry = new THREE.BufferGeometry();
const glowPositions = new Float32Array(glowCount * 5);

for (let i = 0; i < glowCount; i++) {
  glowPositions[i * 3] = -50;
  glowPositions[i * 3 + 1] = 0;
  glowPositions[i * 3 + 2] = 0;
}

glowGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(glowPositions, 3)
);

const glowMaterial = new THREE.PointsMaterial({
  color: 0x0080ff,
  size: 1,
  transparent: true,
  opacity: 1,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: false,
});

const glowParticles = new THREE.Points(glowGeometry, glowMaterial);
scene.add(glowParticles);

// Track scroll
let scrollPosition = 0;
let targetScrollPosition = 0;

function updateScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  targetScrollPosition = scrollTop;
}

window.addEventListener('scroll', updateScroll);
updateScroll();

// Animation
function animate() {
  requestAnimationFrame(animate);

  // Smooth scroll with minimal lag
  scrollPosition += (targetScrollPosition - scrollPosition) * 0.14;

  // Move camera with scroll so line follows page content
  camera.position.y = -scrollPosition;
  camera.updateProjectionMatrix();

  // Get spark position on zigzag path
  const sparkPos = getZigzagPosition(scrollPosition);
  const time = Date.now() * 0.003;

  // Update spark positions with electric branching effect
  const positions = sparkGeometry.attributes.position.array;
  for (let i = 0; i < sparkCount; i++) {
    const offset = (i / sparkCount - 0.5) * 10;
    const branchX = Math.sin(time * 6 + i * 0.4) * 2;
    const branchY = Math.sin(time * 4 + i * 0.7) * 2;

    positions[i * 3] = sparkPos.x + branchX;
    positions[i * 3 + 1] = sparkPos.y + offset + branchY;
    positions[i * 3 + 2] = Math.sin(time * 3 + i) * 1;
  }
  sparkGeometry.attributes.position.needsUpdate = true;

  // Update glow with circular pattern
  const glowPos = glowGeometry.attributes.position.array;
  for (let i = 0; i < glowCount; i++) {
    const angle = (i / glowCount) * Math.PI * 2;
    const radius = 5 + Math.sin(time * 2 + i) * 3;

    // glowPos[i * 3] = sparkPos.x + Math.cos(angle + time * 2) * radius;
    // glowPos[i * 3 + 1] = sparkPos.y + Math.sin(angle + time * 2) * radius;
    // glowPos[i * 3 + 2] = 0;
  }
  glowGeometry.attributes.position.needsUpdate = true;

  // Pulse effects
  sparkMaterial.opacity = 0.85 + Math.sin(time * 5) * 0.15;
  glowMaterial.opacity = 0.4 + Math.sin(time * 3.5) * 0.2;

  renderer.render(scene, camera);
}

// Handle resize
function onResize() {
  const height = window.innerHeight;
  camera.top = 0;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(600, height);

  // Recreate zigzag line
  scene.remove(zigzagLine);
  zigzagLine = createZigzagLine();
  scene.add(zigzagLine);
}

window.addEventListener('resize', onResize);

animate();
