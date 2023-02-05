// @ts-nocheck

import * as THREE from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const DEBUG_OPACITY = 0.6;

function createCheckerBoard() {
  const width = 2;
  const height = 2;

  const size = width * height;
  const data = new Uint8Array(3 * size);
  const colors = [new THREE.Color(0x999999), new THREE.Color(0x888888)];

  for (let i = 0; i < size; i++) {
    const stride = i * 3;
    const ck = [0, 1, 1, 0];
    const color = colors[ck[i]];
    data[stride + 0] = Math.floor(color.r * 255);
    data[stride + 1] = Math.floor(color.g * 255);
    data[stride + 2] = Math.floor(color.b * 255);
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1000, 1000);
  return new THREE.MeshStandardMaterial({ map: texture });
}

function getCapsuleAxisSize(capsule: any) {
  return capsule.length * 2;
}

function getSphereAxisSize(sphere: any) {
  return sphere.radius * 2;
}

function getBoxAxisSize(box: any) {
  return Math.max(box.halfsize.x, box.halfsize.y, box.halfsize.z) * 4;
}

function getMeshAxisSize(geom: any) {
  let size = 1;
  for (let i = 0; i < geom.vertices.length; i++) {
    let v = geom.vertices[i];
    size = Math.max(v.x, v.y, v.z);
  }
  return size;
}

function createCapsule(capsule: any, mat: any, debug: boolean) {
  const sphere_geom = new THREE.SphereGeometry(capsule.radius, 16, 16);
  const cylinder_geom = new THREE.CylinderGeometry(
    capsule.radius, capsule.radius, capsule.length - 2 * capsule.radius);

  const sphere1 = new THREE.Mesh(sphere_geom, mat);
  sphere1.baseMaterial = sphere1.material;
  sphere1.position.set(0, 0, capsule.length / 2 - capsule.radius);
  sphere1.castShadow = true;

  const sphere2 = new THREE.Mesh(sphere_geom, mat);
  sphere2.baseMaterial = sphere2.material;
  sphere2.position.set(0, 0, -capsule.length / 2 + capsule.radius);
  sphere2.castShadow = true;

  const cylinder = new THREE.Mesh(cylinder_geom, mat);
  cylinder.baseMaterial = cylinder.material;
  cylinder.castShadow = true;
  cylinder.rotation.x = -Math.PI / 2;

  if (debug) {
    sphere1.material.transparent = true;
    sphere2.material.transparent = true;
    cylinder.material.transparent = true;
    sphere1.material.opacity = DEBUG_OPACITY;
    sphere2.material.opacity = DEBUG_OPACITY;
    cylinder.material.opacity = DEBUG_OPACITY;
  }

  const group = new THREE.Group();
  group.add(sphere1, sphere2, cylinder);
  return group;
}

function createBox(box: any, mat: any, debug: boolean) {
  const geom = new THREE.BoxBufferGeometry(
    2 * box.halfsize.x, 2 * box.halfsize.y, 2 * box.halfsize.z);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.baseMaterial = mesh.material;
  if (debug) {
    mesh.material.transparent = true;
    mesh.material.opacity = DEBUG_OPACITY;
  }
  return mesh;
}

function createPlane(plane: any, mat: any) {
  const geometry = new THREE.PlaneGeometry(2000, 2000);
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.receiveShadow = true;
  mesh.baseMaterial = mesh.material;

  return mesh;
}

function createSphere(sphere: any, mat: any, debug: boolean) {
  const geom = new THREE.SphereGeometry(sphere.radius, 16, 16);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.baseMaterial = mesh.material;
  if (debug) {
    mesh.material.transparent = true;
    mesh.material.opacity = DEBUG_OPACITY;
  }
  return mesh;
}

function createHeightMap(heightMap: any, mat: THREE.Material) {
  const size = heightMap.size;
  const n_subdiv = Math.sqrt(heightMap.data.length) - 1;

  if (!Number.isInteger(n_subdiv)) {
    throw 'The data length for an height map should be a perfect square.';
  }

  function builder(v: number, u: number, target: THREE.Vector3) {
    const idx = Math.round(v * (n_subdiv) + u * n_subdiv * (n_subdiv + 1));
    const x = u * size;
    const y = -v * size;
    const z = heightMap.data[idx];
    target.set(x, y, z).multiplyScalar(1);
  }

  const geom = new ParametricGeometry(builder, n_subdiv, n_subdiv);
  geom.normalizeNormals();

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(geom, mat);
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

function createClippedPlane(halfsizeX: any, halfsizeY: any, mat: THREE.Material) {
  const bufferGeometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    // 1st triangle.
    -halfsizeX, -halfsizeY, 0.0,
    halfsizeX, -halfsizeY, 0.0,
    halfsizeX, halfsizeY, 0.0,
    // 2nd triangle.
    halfsizeX, halfsizeY, 0.0,
    -halfsizeX, halfsizeY, 0.0,
    -halfsizeX, -halfsizeY, 0.0,
    // 3rd triangle.
    halfsizeX, halfsizeY, 0.0,
    halfsizeX, -halfsizeY, 0.0,
    -halfsizeX, -halfsizeY, 0.0,
    // 4th triangle.
    -halfsizeX, -halfsizeY, 0.0,
    -halfsizeX, halfsizeY, 0.0,
    halfsizeX, halfsizeY, 0.0,
  ]);
  bufferGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(vertices, 3));
  bufferGeometry.computeVertexNormals();

  const mesh = new THREE.Mesh(bufferGeometry, mat);
  mesh.castShadow = true;
  mesh.baseMaterial = mesh.material;
  return mesh;
}

function createMesh(mesh_config: any, geom: any, mat: any, debug: boolean, parent: any) {
  if (geom && geom.path) {
    // {
    // let object;
    // function loadModel() {
    //   object.traverse(function (child) {
    //     // if (child.isMesh) child.material.map = texture;1
    //     object.position.z = 2.5;
    //     object.position.y = 0.5;
    //     object.rotation.z = -Math.PI / 2;
    //   });
    //   // object.rotation.y = -Math.PI / 2;
    //   parent.add(object);
    // }

    // const manager = new THREE.LoadingManager(loadModel);
    //   // texture
    //   // const textureLoader = new THREE.TextureLoader(manager);
    //   // const texture = textureLoader.load('textures/uv_grid_opengl.jpg');

    //   // model
    // function onProgress(xhr) {
    //   if (xhr.lengthComputable) {
    //     const percentComplete = xhr.loaded / xhr.total * 100;
    //     console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');
    //   }
    // }

    // function onError() { }

    // const loader = new OBJLoader(manager);
    // loader.load('./silica.obj', function (obj) {
    //   object = obj;
    // }, onProgress, onError);
    // return null;







    // const onProgress = function (xhr) {
    //   if (xhr.lengthComputable) {
    //     const percentComplete = xhr.loaded / xhr.total * 100;
    //     console.log(Math.round(percentComplete, 2) + '% downloaded');
    //   }
    // };

    // new MTLLoader()
    //   .setPath('./obj/female02/')
    //   .load('female02.mtl', function (materials) {
    //     materials.preload();
    //     new OBJLoader()
    //       .setMaterials(materials)
    //       .setPath('./obj/female02/')
    //       .load('female02.obj', function (object) {
    //         // object.position.y = 0;
    //         object.position.x = 1;
    //         object.rotation.y = Math.PI / 2;
    //         object.rotation.z = Math.PI / 2;
    //         object.scale.multiplyScalar(0.01);
    //         parent.add(object);
    //       }, onProgress);
    //   });
    // return null;

    /**@type string */
    const path = geom.path;
    if (path.endsWith('fbx')) {
      const loader = new FBXLoader();
      loader.load(`./${path}`, function (object) {
        object.traverse(function (child) {
          if ((child).isMesh) {
            (child).material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xff0000, shininess: 200, vertexColors: true, });
            if ((child).material) {
              child.material.transparent = false;
            }
          }
          child.position.y = 0;
          child.position.x = 1;
          child.position.z = 3;
        });
        object.visible = true;
        parent.add(object);
      },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded ' + path);
        },
        (error) => {
          console.log(error);
        });
      return null;
    }
    if (path.endsWith('ply')) {
      const loader = new PLYLoader();
      loader.load(`./table_only.ply`, function (geometry) {
        // geometry.computeVertexNormals();
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xff0000, shininess: 200, vertexColors: true, });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.y = 1;
        mesh.position.z = 3;
        // mesh.rotation.z = Math.PI / 2;
        // mesh.rotation.x = - Math.PI / 2;
        mesh.scale.multiplyScalar(1);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.visible = true;
        parent.add(mesh);
      });
    }
    return null;
  };
  // }
  const bufferGeometry = new THREE.BufferGeometry();
  const vertices = geom.vertices;
  const positions = new Float32Array(vertices.length * 3);
  const scale = mesh_config.scale ? mesh_config.scale : 1;
  // Convert the coordinate system.
  vertices.forEach(function (vertice, i) {
    positions[i * 3] = vertice.x * scale;
    positions[i * 3 + 1] = vertice.y * scale;
    positions[i * 3 + 2] = vertice.z * scale;
  });
  const indices = new Uint16Array(geom.faces);
  bufferGeometry.setAttribute(
    'position', new THREE.BufferAttribute(positions, 3));
  bufferGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
  bufferGeometry.computeVertexNormals();

  const mesh = new THREE.Mesh(bufferGeometry, mat);
  mesh.castShadow = true;
  mesh.baseMaterial = mesh.material;
  mesh.material.vertexColors = false;
  if (debug) {
    mesh.material.transparent = true;
    mesh.material.opacity = DEBUG_OPACITY;
  }
  return mesh;
}

function hasContactDebug(system: any) {
  if (system.hasOwnProperty('has_contact_debug')) {
    return system.has_contact_debug;
  }
  let maxLen = 0;
  for (let i = 0; i < system.contact_pos?.length; i++) {
    maxLen = Math.max(system.contact_pos[i].length, maxLen);
  }
  system.has_contact_debug = system.debug && (maxLen > 0);
  return system.has_contact_debug;
}

function createScene(system: any) {
  const scene = new THREE.Scene();
  const meshGeoms = {};
  system.config.meshGeometries.forEach(function (geom) {
    meshGeoms[geom.name] = geom;
  });
  if (system.debug) {
    // Add a world axis for debugging.
    const worldAxis = new THREE.AxesHelper(100);
    scene.add(worldAxis);
  }
  let minAxisSize = 1e6;
  system.config.bodies.forEach(function (body) {
    const parent = new THREE.Group();
    parent.name = body.name.replaceAll('/', '_');  // sanitize node name
    body.colliders.forEach(function (collider) {
      const color = collider.color
        ? collider.color
        : body.name.toLowerCase() == 'target' ? '#ff2222' : '#665544';
      let mat = ('plane' in collider)
        ? createCheckerBoard()
        : ('heightMap' in collider)
          ? new THREE.MeshStandardMaterial({ color: color, flatShading: true })
          : new THREE.MeshPhongMaterial({ color: color, useVertexColor: true });
      let child;
      let axisSize;
      if ('box' in collider) {
        child = createBox(collider.box, mat, system.debug);
        axisSize = getBoxAxisSize(collider.box);
      } else if ('capsule' in collider) {
        child = createCapsule(collider.capsule, mat, system.debug);
        axisSize = getCapsuleAxisSize(collider.capsule);
      } else if ('plane' in collider) {
        child = createPlane(collider.plane, mat);
      } else if ('sphere' in collider) {
        child = createSphere(collider.sphere, mat, system.debug);
        axisSize = getSphereAxisSize(collider.sphere);
      } else if ('heightMap' in collider) {
        child = createHeightMap(collider.heightMap, mat);
      } else if ('mesh' in collider) {
        child = createMesh(
          collider.mesh, meshGeoms[collider.mesh.name], mat, system.debug, parent);
        axisSize = getMeshAxisSize(meshGeoms[collider.mesh.name]);
      } else if ('clippedPlane' in collider) {
        child = createClippedPlane(
          collider.clippedPlane.halfsizeX, collider.clippedPlane.halfsizeY,
          mat);
        axisSize = (collider.clippedPlane.halfsizeX +
          collider.clippedPlane.halfsizeY) / 2.0;
      }
      if (collider.rotation) {
        const rot = new THREE.Vector3(
          collider.rotation.x, collider.rotation.y, collider.rotation.z);
        rot.multiplyScalar(Math.PI / 180);
        const eul = new THREE.Euler();
        eul.setFromVector3(rot);
        child.quaternion.setFromEuler(eul);
      }
      if (collider.position) {
        child.position.set(
          collider.position.x, collider.position.y, collider.position.z);
      }
      if (system.debug && axisSize) {
        const debugAxis = new THREE.AxesHelper(axisSize);
        child.add(debugAxis);
        minAxisSize = Math.min(minAxisSize, axisSize);
      }
      if (child) {
        child.visible = !collider.hidden;
        parent.add(child);
      }
    });
    scene.add(parent);
  });

  // Add contact position debug points.
  if (hasContactDebug(system)) {
    for (let i = 0; i < system.contact_pos[0].length; i++) {
      const parent = new THREE.Group();
      parent.name = 'contact' + i;
      let child;

      const mat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const sphere_geom = new THREE.SphereGeometry(minAxisSize / 20.0, 6, 6);
      child = new THREE.Mesh(sphere_geom, mat);
      child.baseMaterial = child.material;
      child.castShadow = false;
      child.position.set(0, 0, 0);

      parent.add(child);
      scene.add(parent);
    }
  }

  return scene;
}

function createTrajectory(system: any) {
  const times =
    [...Array(system.pos.length).keys()].map(x => x * system.config.dt);
  const tracks = [];

  system.config.bodies.forEach(function (body: any, bi: any) {
    const group = body.name.replaceAll('/', '_');  // sanitize node name
    const pos = system.pos.map((p: any) => [p[bi][0], p[bi][1], p[bi][2]]);
    const rot = system.rot.map((r: any) => [r[bi][1], r[bi][2], r[bi][3], r[bi][0]]);
    tracks.push(new THREE.VectorKeyframeTrack(
      'scene/' + group + '.position', times, pos.flat()));
    tracks.push(new THREE.QuaternionKeyframeTrack(
      'scene/' + group + '.quaternion', times, rot.flat()));
  });

  // Add contact point debug.
  if (hasContactDebug(system)) {
    for (let i = 0; i < system.contact_pos[0].length; i++) {
      const group = 'contact' + i;
      const pos = system.contact_pos.map((p: any) => [p[i][0], p[i][1], p[i][2]]);
      const visible = system.contact_penetration.map((p: any) => p[i] > 1e-6);
      tracks.push(new THREE.VectorKeyframeTrack(
        'scene/' + group + '.position', times, pos.flat(),
        THREE.InterpolateDiscrete));
      tracks.push(new THREE.BooleanKeyframeTrack(
        'scene/' + group + '.visible', times, visible));
    }
  }

  return new THREE.AnimationClip('Action', -1, tracks);
}

export { createScene, createTrajectory };
