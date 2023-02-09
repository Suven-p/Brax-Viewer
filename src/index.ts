// @ts-nocheck

import * as THREE from 'three';
import { Viewer } from './viewer';
import system from './braxConfig2.json';
import xipos from '../dataset/xipos.json';
import ximat from '../dataset/ximat.json';
import { mocapMotion } from '../dataset/mocapmotion';

declare global {
    interface Window {
        system: any;
        mocapMotion: any;
        xipos: any;
        ximat: any;
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
        const q = new THREE.Quaternion();
        q.setFromRotationMatrix(m);
        return [q.w, q.x, q.y, q.z];
    });
});
system.pos = window.xipos;
system.rot = window.ximat;




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
