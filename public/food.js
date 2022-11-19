import * as THREE from 'three'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'

const appleModel = '../assets/apple.glb'
const cakeModel = '../assets/cake.glb'
const chickenModel = '../assets/chicken.glb'

class Food {
    constructor(scene, type) {
        this.scene = scene
        this.type = type
        switch(type){
            case 'apple':
                this.model = appleModel
                this.scale = 0.008
                this.y = 0.28
                this.friendship = 5
                this.price = 10
                break
            case 'cake':
                this.model = cakeModel
                this.scale = 1
                this.y = 0
                this.friendship = 20
                this.price = 50
                break
            case 'chicken':
                this.model = chickenModel
                this.scale = 0.03
                this.y = 0.4
                this.friendship = 50
                this.price = 200
                break
            default:
                this.model = appleModel
                this.scale = 0.01
                this.y = 0.35
                this.friendship = 5
                this.price = 10
        }
        this.loader = new GLTFLoader()
        this.loader.load(
            this.model,
            (gltf) => {
                this.food = gltf.scene
                this.food.scale.setScalar(this.scale)
                this.food.position.set(6, 6, 6)
                this.food.visible = false
                this.food.traverse((child) => {
                    if (child.isMesh){
                        child.castShadow = true
                        child.receiveShadow = true
                        child.name = this.type
                        child.material = new THREE.MeshPhongMaterial({
                            map: child.material.map,
                            shininess: 30
                        })
                    }
                })
                this.scene.add(this.food)
            }
        )
    }

    show() {
        this.food.visible = true
    }

    hide() {
        this.food.visible = false
    }

    setPosition(x, z) {
        this.food.position.set(x, this.y, z)
    }

    goOut() {
        this.food.position.set(6, 6, 6)
    }
}

export { Food }