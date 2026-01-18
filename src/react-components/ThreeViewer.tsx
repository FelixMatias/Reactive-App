import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

export function ThreeViewer() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Using a Ref to hold the requestAnimationFrame ID for cleanup
  const requestRef = React.useRef<number>();

  React.useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    // 2. Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(directionalLight, ambientLight);

    // 3. Helpers
    const axes = new THREE.AxesHelper();
    const grid = new THREE.GridHelper();
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.4;
    scene.add(axes, grid);

    // 4. Loading Logic
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("../assets/Gear/Gear1.obj", (object) => {
        scene.add(object);
      });
    });

    // 5. Responsive Handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    // 6. Animation Loop
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    // 7. Cleanup (The most important part)
    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      
      // Dispose of Three.js objects
      renderer.dispose();
      controls.dispose();
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="dashboard-card"
      style={{ width: '100%', height: '100%', minWidth: 0, position:"absolute" }}
    />
  );
}