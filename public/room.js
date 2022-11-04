import * as THREE from 'three'

function buildWall(scene, width, height, img, repeat, rot, pos){
    const wallGeo = new THREE.PlaneGeometry(width, height)
    const wallText = new THREE.TextureLoader().load(img)
    wallText.wrapS = THREE.RepeatWrapping
    wallText.wrapT = THREE.RepeatWrapping
    wallText.repeat.set(repeat[0], repeat[1])
    const wallMat = new THREE.MeshPhongMaterial({
        map: wallText,
        side: THREE.DoubleSide,
        shininess: 5
    })
    const wall = new THREE.Mesh(wallGeo, wallMat)
    wall.rotation.set(rot[0], rot[1], rot[2])
    wall.position.set(pos[0], pos[1], pos[2])

    wall.receiveShadow = true
    scene.add(wall)
}

export { buildWall }