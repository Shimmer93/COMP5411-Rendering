import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import Stats from './jsm/libs/stats.module.js'
import { GUI } from './jsm/libs/lil-gui.module.min.js'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'

import { buildWall } from './room.js'
import { buildSlime} from './slime.js'

// Scene
const scene = new THREE.Scene()

// Clock
const clock = new THREE.Clock()

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 4, 4)

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
const type = 'normal'
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
})
const cubeCamera = new THREE.CubeCamera( 0.1, 1000, cubeRenderTarget )
// buildSlime(scene, gui, type, cubeRenderTarget, cubeCamera, mixer)

let mixer
let slime
let eye1
let eye2
let apple
let heart
const loader = new GLTFLoader()
const eyeText = new THREE.TextureLoader().load('../assets/eye.png')
const eyeMat = new THREE.MeshPhongMaterial({
    map: eyeText,
    transparent: true
})
loader.load(
    '../assets/animated_slime.glb',
    (gltf) => {
        slime = gltf.scene
        console.log(gltf)
        
        mixer = new THREE.AnimationMixer(slime)
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play()
        })
        
        let slimeMat
        switch (type) {
            case 'normal':
                slimeMat = new THREE.MeshPhongMaterial({
                    color: 0x00cccc,
                    shininess: 30
                })
                break;
            case 'wood':
                const woodText = new THREE.TextureLoader().load('../assets/wood.jpg')
                slimeMat = new THREE.MeshPhongMaterial({
                    map: woodText,
                    shininess: 30
                })
                break;
            case 'metal':
                slimeMat = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    specular: 0xffffff,
                    shininess: 100,
                    envMap: cubeRenderTarget.texture
                })
                break;
            case 'bubble':
                slimeMat = new THREE.MeshPhongMaterial({
                    color: 0xeeeeee,
                    shininess: 30,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                })
                break;
            case 'glass':
                slimeMat = new THREE.MeshPhysicalMaterial({
                    roughness: 0,
                    transmission: 1,
                    thickness: 2
                })
                break;
            default:
                slimeMat = new THREE.MeshPhongMaterial({
                    color: 0x00cccc,
                    shininess: 30
                })
        }
            
        slime.traverse((child) => {
            if (child.isMesh){
                child.material = slimeMat
                child.castShadow = true
                child.receiveShadow = true
                if (type == 'metal'){
                    child.add(cubeCamera)
                }
            }
        })

        // eyes
        const eyeGeo = new THREE.PlaneGeometry(0.1, 0.2)
        eye1 = new THREE.Mesh(eyeGeo, eyeMat)
        eye1.position.set(0.3, 0.05, 0.85)
        eye2 = new THREE.Mesh(eyeGeo, eyeMat)
        eye2.position.set(-0.3, 0.05, 0.85)
        const eyes = new THREE.Group()
        eyes.add(eye1)
        eyes.add(eye2)
        slime.add(eyes)

        // heart
        const heartLoader = new GLTFLoader()
        heartLoader.load(
            '../assets/heart.glb',
            (gltf) => {
                heart = gltf.scene
                heart.scale.set(0.2, 0.2, 0.2)
                heart.position.set(0.8, 0.6, 0)
                heart.visible = false

                heart.traverse((child) => {
                    if (child.isMesh){
                        child.material = new THREE.MeshPhongMaterial({
                            color: 0xff0000,
                            shininess: 30
                        })
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                slime.add(heart)
            }
        )
        
        slime.position.set(0, 0.6, 0)
        scene.add(slime)
        
        const slimeFolder = gui.addFolder('Slime')
        slimeFolder.add(slime.position, 'x', -5, 5, 0.1).name('Position X')
        slimeFolder.add(slime.position, 'y', 0, 5, 0.1).name('Position Y')
        slimeFolder.add(slime.position, 'z', -5, 5, 0.1).name('Position Z')
        slimeFolder.open()
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    (error) => {
        console.error(error)
    }
)

const loader2 = new GLTFLoader()
loader2.load(
    '../assets/apple.glb',
    (gltf) => {
        apple = gltf.scene
        apple.position.set(2, 0.6, 2)
        apple.scale.set(0.01, 0.01, 0.01)
        console.log(apple)

        apple.traverse((child) => {
            if (child.isMesh){
                child.castShadow = true
                child.receiveShadow = true
                let appleText = child.material.map
                let appleMat = new THREE.MeshPhongMaterial({
                    map: appleText,
                    shininess: 30
                })
                child.material = appleMat
            }
        })

        scene.add(apple)

        const appleFolder = gui.addFolder('Apple')
        appleFolder.add(apple.position, 'x', -5, 5, 0.1).name('Position X')
        appleFolder.add(apple.position, 'y', 0, 5, 0.1).name('Position Y')
        appleFolder.add(apple.position, 'z', -5, 5, 0.1).name('Position Z')
        appleFolder.open()
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    },
    (error) => {
        console.error(error)
    }
)
    
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
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const happyEyeText = new THREE.TextureLoader().load('../assets/eye_happy.png')
const happyEyeMat = new THREE.MeshPhongMaterial({
    map: happyEyeText,
    transparent: true
})

window.addEventListener(
    'mousedown',
    (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        let intersects = raycaster.intersectObjects(scene.children, true)
        if (intersects.length > 0){
            let obj = intersects[0].object
            console.log(obj.name)
            if (obj.name == 'Object_4') {
                controls.enabled = false
                eye1.material = happyEyeMat
                eye2.material = happyEyeMat
                heart.visible = true
            }
            
        }
    }
)

window.addEventListener(
    'mouseup',
    () => {
        controls.enabled = true
        eye1.material = eyeMat
        eye2.material = eyeMat
        heart.visible = false
    }
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

    const delta = clock.getDelta()
    if (mixer) mixer.update(delta)

    renderer.render(scene, camera)
}

animate()
