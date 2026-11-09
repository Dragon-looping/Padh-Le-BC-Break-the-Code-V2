import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface HeroSceneProps {
  reducedMotion?: boolean;
}

export function HeroScene({ reducedMotion = false }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    // If reduced motion is explicitly preferred, do not mount WebGL canvas
    if (reducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    // Determine particle tier based on viewport and device concurrency
    const width = container.clientWidth || window.innerWidth;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const particleCount = isMobile ? 14000 : isTablet ? 30000 : 60000;
    const maxDpr = isMobile ? 1.25 : 1.75;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0.6, 0.2, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    container.appendChild(renderer.domElement);

    // Build geometry: spiralling ribbons offset to the right (leaving left third calm)
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const seeds = new Float32Array(particleCount);

    const cyanColor = new THREE.Color('#19E3FF');
    const orangeColor = new THREE.Color('#FF6B1A');
    const deepCyan = new THREE.Color('#083344');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const t = i / particleCount;
      const angle = t * Math.PI * 14.0 + Math.random() * 0.4;
      const radius = 0.3 + Math.pow(Math.random(), 1.6) * 2.2;
      const z = (Math.random() - 0.5) * 3.5;

      // Center the vortex toward the right side (+0.6) so left third remains clear for headline
      positions[i3] = 0.5 + Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * (radius * 0.75) + Math.sin(t * 10.0) * 0.2;
      positions[i3 + 2] = z;

      // Color choice: 85% cyan shades, 15% sparse orange threads
      const isOrange = Math.random() > 0.88;
      const c = isOrange ? orangeColor : Math.random() > 0.5 ? cyanColor : deepCyan;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      seeds[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 1));

    // Custom Shader Material for GPU vertex-shader animation
    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uScroll;
        attribute vec3 color;
        attribute float seed;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = color;
          vec3 pos = position;

          // Swirl rotation around Z and Y
          float distFromCore = length(pos.xy - vec2(0.5, 0.0));
          float speed = 0.35 + (1.0 / (distFromCore + 0.5)) * 0.3;
          float angle = uTime * speed * (0.6 + seed * 0.4);

          float cosA = cos(angle);
          float sinA = sin(angle);
          mat2 rot = mat2(cosA, -sinA, sinA, cosA);
          pos.xy = rot * (pos.xy - vec2(0.5, 0.0)) + vec2(0.5, 0.0);

          // Pointer swirl disturbance
          vec2 toPointer = pos.xy - uPointer;
          float pDist = length(toPointer);
          if (pDist < 1.2) {
            float force = (1.0 - pDist / 1.2) * 0.25;
            pos.xy += normalize(toPointer) * force;
          }

          // Scroll camera/vortex tightening effect
          pos.z += uScroll * 1.5;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Size attenuation
          gl_PointSize = (1.8 + seed * 2.2) * (18.0 / -mvPosition.z);
          vAlpha = smoothstep(3.5, 0.5, -mvPosition.z) * (0.4 + seed * 0.6);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Circular particle shape with soft edge
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float edgeAlpha = smoothstep(0.5, 0.1, dist);
          gl_FragColor = vec4(vColor, vAlpha * edgeAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Interactive pointer parallax
    const targetPointer = new THREE.Vector2(0, 0);
    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetPointer.set(x * 1.5, y * 1.5);
    };

    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = window.innerHeight * 2.5;
      uniforms.uScroll.value = Math.min(1.0, scrollY / maxScroll);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Handle visibility / pause when hidden
    let isPaused = false;
    const onVisibilityChange = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isPaused) return;

      const delta = clock.getDelta();
      uniforms.uTime.value += delta;

      // Ease pointer uniform
      uniforms.uPointer.value.lerp(targetPointer, 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  if (reducedMotion || !hasWebGL) {
    // Accessible poster fallback: CSS dot-field poster
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none bg-[radial-gradient(#19E3FF_1px,transparent_1px)] [background-size:24px_24px]"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
    />
  );
}
