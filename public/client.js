import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import Stats from './jsm/libs/stats.module.js'
import { GUI } from './jsm/libs/lil-gui.module.min.js'

import { buildWall } from './room.js'
import { slime } from './slime.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 5, 5)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xcccccc)
scene.add(ambientLight)
const pointLight = new THREE.PointLight(0xffffff)
pointLight.position.set(2, 5, 2)
pointLight.castShadow = true
scene.add(pointLight)

const controls = new OrbitControls(camera, renderer.domElement)

const floorImg = '../assets/floor.jpg'
const wallImg = '../assets/wall.jpg'

// Floor
buildWall(scene, 10, 10, floorImg, [4, 4], [Math.PI/2, 0, 0], [0, 0, 0])
// Ceiling
buildWall(scene, 10, 10, wallImg, [3, 4], [-Math.PI/2, 0, 0], [0, 7.5, 0])
// Walls
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, 0, 0], [0, 3.75, -5])
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, Math.PI, 0], [0, 3.75, 5])
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, Math.PI/2, 0], [-5, 3.75, 0])
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, -Math.PI/2, 0], [5, 3.75, 0])

// Slime
scene.add(slime)

window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    },
    false
)

const stats = Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()
const lightFolder = gui.addFolder('Light')
lightFolder.add(pointLight.position, 'x', -4.99, 4.99)
lightFolder.add(pointLight.position, 'y', 0, 7.49)
lightFolder.add(pointLight.position, 'z', -4.99, 4.99)
lightFolder.add(pointLight.color, 'r', 0, 1)
lightFolder.add(pointLight.color, 'g', 0, 1)
lightFolder.add(pointLight.color, 'b', 0, 1)
lightFolder.open()

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()
