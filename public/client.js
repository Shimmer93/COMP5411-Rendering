import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import Stats from './jsm/libs/stats.module.js'
import { GUI } from './jsm/libs/lil-gui.module.min.js'

import { buildWall } from './room.js'
import { buildSlime} from './slime.js'

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 5, 5)

// Renderer
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)

//GUI
const gui = new GUI()

// Lights
const ambientLight = new THREE.AmbientLight(0x111111)
scene.add(ambientLight)
function addPointLight(intensity, pos){
    const pointLight = new THREE.PointLight(0xffffff, intensity, 100)
    pointLight.position.set(pos[0], pos[1], pos[2])
    pointLight.castShadow = false
    scene.add(pointLight)
}

addPointLight(1, [3, 5, 3])

const rectLight = new THREE.RectAreaLight(0xffffff, 0.5, 2, 2)
rectLight.position.set(0, 7, 0)
rectLight.lookAt(0, 0, 0)
scene.add(rectLight)

// Textures
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
const type = 'metal'
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
})
const cubeCamera = new THREE.CubeCamera( 0.1, 1000, cubeRenderTarget )
buildSlime(scene, gui, type, cubeRenderTarget, cubeCamera)

// Event Listeners
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

// Stats
const stats = Stats()
document.body.appendChild(stats.dom)

// GUI
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()


// Animation
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
}

function render() {
    if (type === 'metal'){
        cubeCamera.update(renderer, scene)
    }
    renderer.render(scene, camera)
}

animate()
