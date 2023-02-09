// @ts-nocheck

import * as THREE from 'three';
import { Viewer } from './viewer';
import system from './braxConfig2.json';
import xipos from '../dataset/xipos.json';
import ximat from '../dataset/ximat.json';
import { mocapMotion } from '../dataset/mocapmotion';
import initialxipos from '../dataset/init_xipos.json';
import initialximat from '../dataset/init_ximat.json';

declare global {
    interface Window {
        system: any;
        mocapMotion: any;
        xipos: any;
        ximat: any;
        initialximat: any;
    }
}

const domElement = document.getElementById('brax-viewer');
window.system = system;
window.mocapMotion0 = mocapMotion;
window.mocapMotion0.forEach((motion) => {
    motion.splice(0, 1);
    motion.splice(19, 1);
});
window.xipos = xipos.xipos;
window.xipos.forEach((motion) => {
    motion.splice(1, 1);
    motion.splice(19, 1);
});
window.ximat = ximat.ximat.map((motion) => {
    motion.splice(1, 1);
    motion.splice(19, 1);
    return motion.map(body => {
        const m = new THREE.Matrix4();
        m.fromArray([body[0], body[1], body[2], 0, body[3], body[4], body[5], 0, body[6], body[7], body[8], 0, 0, 0, 0, 1]);
        const e = new THREE.Euler();
        e.setFromRotationMatrix(m);
        e.x += 45;
        const q = new THREE.Quaternion();
        q.setFromRotationMatrix(m);
        return [q.w, q.x, q.y, q.z];
    });
});
window.initialxipos = window.xipos[0].map(body => {
    return { x: body[0], y: body[1], z: body[2] };
});
window.initialxipos.splice(1, 1);
window.initialxipos.splice(19, 1);
window.initialximat = window.ximat[0].map(body => {
    const m = new THREE.Matrix4();
    m.fromArray([body[0], body[1], body[2], 0, body[3], body[4], body[5], 0, body[6], body[7], body[8], 0, 0, 0, 0, 1]);
    const e = new THREE.Euler();
    e.setFromRotationMatrix(m);
    return { x: e.x, y: e.y, z: e.z };
});
window.initialximat.splice(1, 1);
window.initialximat.splice(19, 1);

system.pos = window.xipos;
system.rot = window.ximat;
// system.pos = [window.xipos[window.xipos.length - 1]];
// system.rot = [window.ximat[window.xipos.length - 1]];

system.config.bodies.forEach((body, i) => {
    if (i === 0) return;
    body.colliders.forEach((collider) => {
        if (!collider || !collider.position) return;
        collider.position = { x: 0.0, y: 0.0, z: 0.0 };
        collider.rotation = { x: 0.0, y: 0.0, z: 0.0 };
        const radToDeg = THREE.MathUtils.radToDeg;
        if (body.name === 'head') {
            collider.position.y = -0.1;
        }
        if (body.name === 'lclavicle') {
            collider.position = {
                "x": 0.08,
                "y": -0.3,
                "z": 0.2
            };
            collider.rotation = {
                "x": -75,
                "y": -68,
                "z": -100
            };
        }
    });
});


// system.config.bodies.push({
//     "name": "Target",
//     "colliders": [
//         {
//             "position": {
//                 "x": 1.0,
//                 "y": 0.0,
//                 "z": 0.05
//             },
//             "sphere": {
//                 "radius": 0.1
//             },
//             "material": {
//                 "friction": 1.0,
//                 "elasticity": 0.0
//             },
//             "color": "",
//             "hidden": false,
//             "noContact": false
//         }
//     ],
//     "inertia": {
//         "x": 1.0,
//         "y": 1.0,
//         "z": 1.0
//     },
//     "mass": 10.0
// });
// system.pos[0].push([1, 0, 0.05]);
// system.rot[0].push([1, 0, 0, 0]);

// Make target move diagonally
// const length = 5;
// const time = 2.0;
// const timeStep = system.config.dt / 10;
// const numSteps = Math.round(time / timeStep);
// for (let i = 0; i < numSteps; i += 1) {
//     system.pos.push(JSON.parse(JSON.stringify(system.pos[i])));
//     system.rot.push(JSON.parse(JSON.stringify(system.rot[0])));
//     system.pos[i + 1][system.pos[0].length - 1][0] += (length / numSteps);
//     system.pos[system.pos.length - 1][system.pos[0].length - 1][1] += (length / numSteps);
// }

var viewer = new Viewer(domElement, system);
