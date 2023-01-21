
import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as CANNON from "cannon";

var scene, camera, renderer;
var world;
const originalBoxSize = 3;
var gameStarted = false;

let stack = [];
let overhangs = [];
const boxHeight = 1;

var lastTime;

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
          //cut layer into remaining box and hanging part which is to fall
          const newWidth = direction == "x" ? overlap : topLayer.width;
          const newDepth = direction == "z" ? overlap : topLayer.depth;

          //update toplayer
          topLayer.width = newWidth;
          topLayer.depth = newDepth;

          //Update three.js model
          topLayer.threejs.scale[direction] = overlap / size;
          topLayer.threejs.position[direction] -= delta / 2;

          //Update CannonJS model
          topLayer.cannonjs.position[direction] -= delta / 2
          //Replace CannonJS shape with smaller shape
          const shape = new CANNON.Box(new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2));
          topLayer.cannonjs.shapes = [];
          topLayer.cannonjs.addShape(shape);

          //Calculate hanging portion to simulate fall
          const hangingShift = (overlap / 2 + hangingSize / 2) * Math.sign(delta);
          const hangingX =
            direction === "x" ? topLayer.threejs.position.x + hangingShift :
              topLayer.threejs.position.x;
          const hangingZ =
            direction === "z" ? topLayer.threejs.position.z + hangingShift :
              topLayer.threejs.position.z;
          const hangingWidth = direction === "x" ? hangingSize : newWidth;
          const hangingDepth = direction === "z" ? hangingSize : newDepth;
          addOverhang(hangingX, hangingZ, hangingWidth, hangingDepth)

          //Add next layer
          const nextX = direction === "x" ? topLayer.threejs.position.x : -10;
          const nextZ = direction === "z" ? topLayer.threejs.position.z : -10;
          const nextDirection = direction === "x" ? "z" : "x";
          addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);

        } else {
          //Stop Game
        }
      }
    });


    return () => mountRef.current.removeChild(renderer.domElement);
  });

  return (
    <div ref={mountRef} />
  );
}

//This function handles creating the scene
const init = (mountRef) => {

  lastTime = 0;
  stack = [];
  overhangs = [];

  //Setup world for CannonJS
  world = new CANNON.World();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 40;

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
   camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000);

  // camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  // var camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 100);

  //Setup Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setAnimationLoop(animation);

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

//Function to add layers
const addLayer = (x, z, width, depth, direction) => {
  const y = boxHeight * stack.length;
  const layer = generateBox(x, y, z, width, depth);
  layer.direction = direction;

  stack.push(layer);
}


// Function to add overhangs
const addOverhang = (x, z, width, depth) => {
  const y = boxHeight * (stack.length - 1);
  const overhang = generateBox(x, y, z, width, depth, true);
  overhangs.push(overhang);
}

//Function to generate boxes
const generateBox = (x, y, z, width, depth, falls) => {

  //Box for Three.js
  var geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  var color = new THREE.Color(`hsl(${30 + stack.length * 4},100%,50%)`);
  var material = new THREE.MeshLambertMaterial({ color });

  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z)
  scene.add(mesh);

  //Duplicate same box in CannonJS
  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2));
  let mass = falls ? 5 : 0;
  const body = new CANNON.Body({ mass, shape });
  body.position.set(x, y, z);
  world.addBody(body)

  return {
    threejs: mesh, cannonjs: body, width, depth
  }
}

const animation = () => {
  const speed = 0.1
  const topLayer = stack[stack.length - 1];
  topLayer.threejs.position[topLayer.direction] += speed
  topLayer.cannonjs.position[topLayer.direction] += speed

  if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
    camera.position.y += speed
  }
  updatePhysics()

  renderer.render(scene, camera);
}

const updatePhysics = () => {
  world.step(1 / 360);

  //Copy coordinates from Cannon to Three
  overhangs.forEach((element) => {
    element.threejs.position.copy(element.cannonjs.position)
    element.threejs.quaternion.copy(element.cannonjs.quaternion)
  });

}
export default App;