import * as THREE from 'three'
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js'

const SLIME_TYPES = ['normal', 'wood', 'metal', 'bubble', 'glass']

function buildSlime(scene, gui, type, cubeRenderTarget, cubeCamera){
    const loader = new GLTFLoader()
    loader.load(
        '../assets/slime.glb',
        (gltf) => {
            const slime = gltf.scene
            // const slimeMat = new THREE.MeshStandardMaterial({
            //     // color: 0xeeeeee,
            //     // shininess: 10,
            //     metalness: 0.5,
            //     roughness: 0.8
            // })
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
}
    
export { SLIME_TYPES, buildSlime }