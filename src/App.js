
import { useEffect, useRef } from "react";
import * as THREE from "three";

var scene, camera, renderer;
const originalBoxSize = 3;

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

  //Foundation
  addLayer(0, 0, originalBoxSize, originalBoxSize)
  //First Layer
  addLayer(-10, 0, originalBoxSize, originalBoxSize, "x")

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

let stack = [];
const boxHeight = 1;

//Function to add layers
const addLayer = (x, z, width, depth, direction) => {
  const y = boxHeight * stack.length;
  const layer = generateBox(x, y, z, width, depth);
  layer.direction = direction;

  stack.push(layer);
}

//Function to generate boxes
const generateBox = (x, y, z, width, depth) => {

  var geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  var color = new THREE.Color(`hsl(${30 + stack.length * 4},100%,50%)`);
  var material = new THREE.MeshLambertMaterial({ color });

  var box = new THREE.Mesh(geometry, material);
  box.position.set(x, y, z)

  scene.add(box);

  return {
    threejs: box, width, depth
  }
}

export default App;