import logo from './logo.svg';
import './App.css';
import * as THREE from 'three';
import { Component } from 'react';

class App extends Component {

  componentDidMount() {
    //function to resize component
    var onWindowResize = function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

    }
    window.addEventListener('resize', onWindowResize, false);

    //Setup Renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.mount.appendChild(renderer.domElement);

    //Create Scene
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //Adding Cube
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xfb8e00 });
    var cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    //Add Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)


    camera.position.z = 5;

    var animate = function () {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();
  }

  render() {
    return (
      <div>
        <div ref={ref => (this.mount = ref)} />

      </div>
    )
  }
}

export default App;
