import * as THREE from 'three'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'

const SLIME_TYPES = ['normal', 'wood', 'metal', 'bubble', 'glass']

const slimeNormalMat = new THREE.MeshPhongMaterial({
    color: 0x00cccc,
    shininess: 30
})

const woodText = new THREE.TextureLoader().load('../assets/wood.jpg')
const slimeWoodMat = new THREE.MeshPhongMaterial({
    map: woodText,
    shininess: 30
})

const slimeMetalMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 100
})

const slimeBubbleMat = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    transmission: 1,
    thickness: 0
})

const slimeGlassMat = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    transmission: 1,
    thickness: 2
})

const eyeText = new THREE.TextureLoader().load('../assets/eye.png')
const eyeMat = new THREE.MeshPhongMaterial({
    map: eyeText,
    transparent: true
})
const happyEyeText = new THREE.TextureLoader().load('../assets/eye_happy.png')
const happyEyeMat = new THREE.MeshPhongMaterial({
    map: happyEyeText,
    transparent: true
})

const heartMat = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    shininess: 30
})

class Slime {
    constructor(scene) {
        this.scene = scene
        this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, {
            format: THREE.RGBFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        })
        this.cubeCamera = new THREE.CubeCamera( 0.1, 1000, this.cubeRenderTarget )

        this.type = 'normal'
        this.petting = false
        this.feeding = false

        this.loader = new GLTFLoader()
        this.slime = null
        this.eye1 = null
        this.eye2 = null
        this.heart = null
        this.mixer = null
        this.loader.load(
            'assets/animated_slime.glb',
            (gltf) => {
                this.slime = gltf.scene
                scene.add(this.slime)
    
                // Animations
                this.mixer = new THREE.AnimationMixer(this.slime)
                gltf.animations.forEach((clip) => {
                    this.mixer.clipAction(clip).play()
                })
                
                // Modifications
                this.slime.position.set(0, 0, 0)
                this.slime.traverse((child) => {
                    if (child.isMesh){
                        child.material = slimeNormalMat
                        child.castShadow = true
                        child.receiveShadow = true
                        child.name = 'slime'
                        child.geometry.translate(0, 0, -0.65)
                        child.add(this.cubeCamera)
                    }
                })
                this.slime.add(this.cubeCamera)
                
                // Eyes
                const eyeGeo = new THREE.PlaneGeometry(0.1, 0.2)
                this.eye1 = new THREE.Mesh(eyeGeo, eyeMat)
                this.eye2 = new THREE.Mesh(eyeGeo, eyeMat)
                this.eye1.position.set(0.3, 0.6, 0.85)
                this.eye2.position.set(-0.3, 0.6, 0.85)
                this.eye1.name = 'eye1'
                this.eye2.name = 'eye2'
                const eyes = new THREE.Group()
                eyes.add(this.eye1)
                eyes.add(this.eye2)
                eyes.name = 'eyes'
                this.slime.add(eyes)
    
                // Heart
                new GLTFLoader().load(
                    '../assets/heart.glb',
                    (gltf) => {
                        this.heart = gltf.scene
                        this.heart.scale.set(0.2, 0.2, 0.2)
                        this.heart.position.set(0.8, 1.2, 0)
                        this.heart.visible = false
    
                        this.heart.traverse((child) => {
                            if (child.isMesh){
                                child.material = heartMat
                                child.castShadow = true
                                child.receiveShadow = true
                                child.name = 'heart'
                            }
                        })
                        this.slime.add(this.heart)
                    }
                )
            }
        )
    }

    changeSlimeType(newType) {
        if (this.type != newType) {
            let slimeMat
            switch (newType) {
                case 'normal':
                    slimeMat = slimeNormalMat
                    break
                case 'wood':
                    slimeMat = slimeWoodMat
                    break
                case 'metal':
                    slimeMat = slimeMetalMat
                    break
                case 'bubble':
                    slimeMat = slimeBubbleMat
                    break
                case 'glass':
                    slimeMat = slimeGlassMat
                    break
                default:
                    slimeMat = slimeNormalMat
            }
                
            this.slime.traverse((child) => {
                if (child.name == 'slime'){
                    child.material = slimeMat
                    if (this.type == 'metal') {
                        child.material.envMap = null
                    }
                    if (newType == 'metal') {
                        child.material.envMap = this.cubeRenderTarget.texture
                        child.material.envMapIntensity = 1
                    }
                    if (this.type == 'glass' || newType == 'bubble') {
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                    if (newType == 'glass' || newType == 'bubble') {
                        child.castShadow = false
                        child.receiveShadow = false
                    }
                }
            })
            this.type = newType
        }
    }

    eat(targetPos, onStartFunc, onCompleteFunc) {
        const tl = gsap.timeline()
    
        const dx = this.slime.position.x - targetPos.x
        const dz = this.slime.position.z - targetPos.z
        const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2))
        let newRot = Math.atan2(dx, dz) + Math.PI
        if (newRot > Math.PI) newRot -= 2 * Math.PI
    
        tl.to(this.slime.rotation, {
            y: newRot,
            duration: 1,
            onStart: onStartFunc
        })
        tl.to(this.slime.position, { 
            x: targetPos.x, 
            z: targetPos.z, 
            duration: d, 
            onComplete: onCompleteFunc
        })
    }

    becomeHappy() {
        this.eye1.material = happyEyeMat
        this.eye2.material = happyEyeMat
        this.heart.visible = true
    }

    resetHappy() {
        this.eye1.material = eyeMat
        this.eye2.material = eyeMat
        this.heart.visible = false
    }

    grow() {
        const currScale = this.slime.scale.x
        if (currScale < 1.6) {
            const tl = gsap.timeline()
            tl.to(this.slime.scale, {
                x: currScale + 0.1,
                y: currScale + 0.1,
                z: currScale + 0.1,
                duration: 0.3
            })
        }
    }
}
    
export { Slime }