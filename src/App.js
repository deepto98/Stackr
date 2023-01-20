
import { useEffect, useRef } from "react";
import * as THREE from "three";

var scene, camera, renderer;

const App = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    init(mountRef)
    return () => mountRef.current.removeChild(renderer.domElement);
  });

  return (
    <div ref={mountRef} />
  );
}

//This function handles creating the scene
const init = (mountRef) => {
  //Create Scene
  scene = new THREE.Scene();

  //Adding Cube
  var geometry = new THREE.BoxGeometry(3, 1, 3);
  var material = new THREE.MeshLambertMaterial({ color: 0xfb8e00 });
  var box = new THREE.Mesh(geometry, material);
  scene.add(box);

  //Add Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 0);
  scene.add(directionalLight);

  //Add Orthographic Camera
  const width = 10;
  const height = width * (window.innerHeight / window.innerWidth);
  camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 100);
  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  //Setup Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  mountRef.current.appendChild(renderer.domElement);

  //Resize on window size change
  let onWindowResize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onWindowResize, false);

}
export default App;