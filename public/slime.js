import * as THREE from 'three'

const slimeGeo = new THREE.SphereGeometry(1, 32, 32)
const slimeMat = new THREE.MeshPhongMaterial({
    color: 0xeeeeee,
    shininess: 10
})
const slime = new THREE.Mesh(slimeGeo, slimeMat)
slime.position.set(0, 1, 0)
slime.castShadow = true

export { slime }