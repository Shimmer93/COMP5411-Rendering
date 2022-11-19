import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import Stats from './jsm/libs/stats.module.js'

import { buildWall } from './room.js'
import { Slime } from './slime.js'
import { Food } from './food.js'

// Data
let friendship = 0
let money = 100

// UI
const friendship_text = document.getElementById('fs')
const money_text = document.getElementById('mn')
const feed_button = document.getElementById('feed')
const type_select = document.getElementById('mat')
const food_select = document.getElementById('food')
const info_text = document.getElementById('info')

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

// BGM
let musicPlaying = false
const listener = new THREE.AudioListener()
camera.add(listener)
const bgm = new THREE.Audio(listener)
const audioLoader = new THREE.AudioLoader()
audioLoader.load('../assets/bgm.mp3', function (buffer) {
    bgm.setBuffer(buffer)
    bgm.setLoop(true)
    bgm.setVolume(0.2)
})

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
const pointLight = new THREE.PointLight(0xffffff, 1, 100)
pointLight.position.set(3, 5, 3)
pointLight.castShadow = true
scene.add(ambientLight)
scene.add(pointLight)

// Room
const floorImg = '../assets/floor.jpg'
const wallImg = '../assets/wall.jpg'

// Floor
buildWall(scene, 10, 10, floorImg, [3, 3], [Math.PI/2, 0, 0], [0, 0, 0], 'floor')
// Ceiling
buildWall(scene, 10, 10, wallImg, [3, 4], [-Math.PI/2, 0, 0], [0, 7.5, 0], 'ceiling')
// Walls
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, 0, 0], [0, 3.75, -5], 'wall1')
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, Math.PI, 0], [0, 3.75, 5], 'wall2')
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, Math.PI/2, 0], [-5, 3.75, 0], 'wall3')
buildWall(scene, 10, 7.5, wallImg, [4, 4], [0, -Math.PI/2, 0], [5, 3.75, 0], 'wall4')

// Slime
let slime = new Slime(scene)
camera.add(slime.meowListener)

// Food
let apple = new Food(scene, 'apple')
let cake = new Food(scene, 'cake')
let chicken = new Food(scene, 'chicken')
let food = apple

// Event listeners
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

window.addEventListener(
    'mousedown',
    (event) => {
        if (musicPlaying == false) {
            bgm.play()
            musicPlaying = true
        }

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        let intersects = raycaster.intersectObjects(scene.children, true)
        if (intersects.length > 0){
            let obj = intersects[0].object
            console.log(obj.name)
            if (obj.name == 'slime') {
                slime.petting = true
                slime.becomeHappy()
                controls.enabled = false
                if (friendship <= 1000) {
                    friendship += 1
                }
            }
            else if (obj.name == 'floor' && food.food.visible == false && slime.feeding) {
                if (money >= food.price){
                    const targetPoint = intersects[0].point
                    console.log(`food type: ${food.type}`)
                    food.setPosition(targetPoint.x, targetPoint.z)
                    slime.eat(targetPoint, 
                        () => {
                            slime.becomeHappy()
                            food.show()
                            if (friendship <= 1000) {
                                friendship += food.friendship
                            }
                            money -= food.price
                        }, 
                        () => {
                            slime.resetHappy()
                            slime.grow()
                            food.goOut()
                            food.hide()
                        }
                    )
                }
            }
        }
    }
)

window.addEventListener(
    'mouseup',
    () => {
        if (slime.petting) {
            controls.enabled = true
            slime.resetHappy()
            slime.petting = false
        }
    }
)

feed_button.addEventListener('click', () => {
    if (slime.feeding) {
        slime.feeding = false
        feed_button.textContent = 'Feed'
        controls.enabled = true
    } 
    else {
        slime.feeding = true
        feed_button.textContent = 'Stop'
    }
})

type_select.addEventListener('change', () => {
    slime.changeSlimeType(type_select.value)
})

food_select.addEventListener('change', () => {
    switch (food_select.value) {
        case 'apple':
            food = apple
            break
        case 'cake':
            food = cake
            break
        case 'chicken':
            food = chicken
            break
    }
})

// Stats
const stats = Stats()
document.body.appendChild(stats.dom)

// Animation
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
}

function render() {
    const delta = clock.getDelta()
    if (money < 1000) {
        money += delta * 3
    }

    friendship_text.textContent = `Friendship: ${friendship}`
    money_text.textContent = `Money: ${parseInt(money)}`
    
    if (slime && slime.type == 'metal'){
        slime.slime.visible = false
        slime.cubeCamera.update(renderer, scene)
        slime.slime.visible = true
    }

    if (slime && slime.isCat == false && friendship >= 100) {
        console.log('Cat!')
        slime.becomeCat()
        info_text.style.display = 'block'
    }

    if (slime.mixer) slime.mixer.update(delta)

    renderer.render(scene, camera)
}

animate()