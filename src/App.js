import logo from './logo.svg';
import './App.css';
import * as THREE from 'three';
import { Component } from 'react';

class App extends Component {

  componentDidMount() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    var onWindowResize = function () {

      camera.aspect = window.innerWidth / window.innerHeight;

      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

    }


    this.mount.appendChild(renderer.domElement);
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    var cube = new THREE.Mesh(geometry, material);
    
    scene.add(cube);

    window.addEventListener('resize', onWindowResize, false);

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
