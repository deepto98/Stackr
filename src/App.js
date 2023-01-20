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

    //Create Scene
    var scene = new THREE.Scene();

    //Adding Cube
    var geometry = new THREE.BoxGeometry(3, 1, 3);
    var material = new THREE.MeshLambertMaterial({ color: 0xfb8e00 });
    var cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    //Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0);
    scene.add(directionalLight);

    //Add Camera

    //PerspectiveCamera
    // var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100);
    // // camera.position.set(4, 4, 4);
    // camera.position.z = 5;
    // camera.lookAt(0, 0, 0);

    //OrthographicCamera
    const width = 10;
    const height = width * (window.innerHeight / window.innerWidth);
    var camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 100);
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);

    //Setup Renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    this.mount.appendChild(renderer.domElement);
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
