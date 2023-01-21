
import { useEffect, useRef } from "react";
import * as THREE from "three";

var scene, camera, renderer;
const originalBoxSize = 3;
var gameStarted = false;

const App = () => {
  const mountRef = useRef(null);

  useEffect(() => {

    init(mountRef)

    window.addEventListener("click", () => {
      if (!gameStarted) {
        renderer.setAnimationLoop(animation);
        gameStarted = true;
      } else {
        const topLayer = stack[stack.length - 1];
        const lastLayer = stack[stack.length - 2];
        const direction = topLayer.direction;

        //Find overlap between current and last box
        const delta = topLayer.threejs.position[direction] - lastLayer.threejs.position[direction]
        const hangingSize = Math.abs(delta);
        const size = direction == "x" ? topLayer.width : topLayer.depth;
        const overlap = size - hangingSize;

        //If there is an overlap, continue the game, otherwise stop
        if (overlap > 0) {

        } else {

        }

        //Build Next Layer
        const nextX = direction === "x" ? 0 : -10;
        const nextZ = direction === "z" ? 0 : -10;
        const newWidth = originalBoxSize;
        const newDepth = originalBoxSize;
        const nextDirection = direction === "x" ? "z" : "x";

        addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);

      }
    });


    return () => mountRef.current.removeChild(renderer.domElement);
  });

  return (
    <div ref={mountRef} />
  );
}
const animation = () => {
  const speed = 0.15
  const topLayer = stack[stack.length - 1];
  topLayer.threejs.position[topLayer.direction] += speed

  if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
    camera.position.y += speed
  }
  renderer.render(scene, camera);
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
  renderer = new THREE.WebGLRenderer({ antialias: false });
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