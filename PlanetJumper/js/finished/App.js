﻿"use strict";

import {PerspectiveCamera, Plane, Raycaster, Scene, Vector2, Vector3, WebGLRenderer} from "../build/three.module.js";
import {SolarSystem} from "./SolarSystem.js";
import {OrbitControls} from "../build/OrbitControls.js";
import {VRButton} from "../build/VRButton.js";
import { CubeTextureLoader } from '../build/three.module.js';

const width = window.innerWidth;
const height= window.innerHeight;
const aspect = width / height;

const fov = 75;
const near = 0.1;
const far = 100;

const camera = new PerspectiveCamera(fov, aspect, near, far);
// Flytter camera vekk fra sentrum, vil ikke ha noe effekt i VR
camera.position.setZ(30);

const raycaster = new Raycaster();
const mouse = new Vector2();
let grabbedObject = null;
const invisiblePlane = new Plane();

const canvas = document.createElement('canvas');
const context = canvas.getContext('webgl2');

const renderer = new WebGLRenderer({canvas, context});
renderer.setClearColor(0x000000); // "Bakgrunnsfarge"
renderer.setSize(width, height);

// Dette er for å ha og aktivere VR
document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.enabled = true;
// end


document.body.appendChild(renderer.domElement);

document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('mousemove', onMouseMove, false);

function onMouseDown(event) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set up raycaster
    raycaster.setFromCamera(mouse, camera);

    // Access planets from solarSystem via the getter
    const planets = solarSystem.getPlanets();
    const intersects = raycaster.intersectObjects(planets); // Ensure planets are accessible

    if (intersects.length > 0) {
        grabbedObject = intersects[0].object; // Grab the planet
        invisiblePlane.setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), grabbedObject.position); // Create an invisible plane

        // Disable OrbitControls when interacting with a planet
        controls.enabled = false;
    }
}

function onMouseUp(event) {
    // Release the object
    grabbedObject = null;

    // Re-enable OrbitControls after releasing the object
    controls.enabled = true;
}

function onMouseMove(event) {
    if (grabbedObject) {
        // Convert mouse position to normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Use raycaster again
        raycaster.setFromCamera(mouse, camera);

        // Intersect the ray with the invisible plane
        const intersectionPoint = new Vector3();
        raycaster.ray.intersectPlane(invisiblePlane, intersectionPoint);

        if (intersectionPoint) {
            grabbedObject.position.copy(intersectionPoint); // Move the planet
        }
    }
}




const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 0;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
})

const scene = new Scene();
const solarSystem = new SolarSystem(scene);

const loader = new CubeTextureLoader();
const texture = loader.load([
    'assets/skybox/right3.png',
    'assets/skybox/left3.png',
    'assets/skybox/top3.png',
    'assets/skybox/bottom3.png',
    'assets/skybox/front3.png',
    'assets/skybox/back3.png'
]);

scene.background = texture;


// Dette er kun hvis VR er i scenen
renderer.setAnimationLoop(render);

function render(){
    solarSystem.animate();

    renderer.render(scene, camera);

    console.log('Planets:', solarSystem.getPlanets());

    // Hvis vi ikke har VR har vi denne
    // window.requestAnimationFrame(render);
}

render();
