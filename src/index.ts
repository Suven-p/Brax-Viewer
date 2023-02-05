// @ts-nocheck

import { Viewer } from './viewer';
import system from './braxConfig.json';
import { isJsxClosingFragment } from 'typescript';

declare global {
    interface Window {
        system: any;
    }
}

const domElement = document.getElementById('brax-viewer');
window.system = system;

// system.config.bodies.forEach(body => {
//     if (body.colliders && body.colliders.length > 0) {
//         body.colliders.forEach(collider => {
//             if (!collider.rotation) {
//                 collider.rotation = { x: 0.0, y: 0.0, z: 0.0 };
//             }
//             collider.rotation.x += 90.0;
//             if (!collider.position) {
//                 collider.position = { x: 0.0, y: 0.0, z: 0.0 };
//             }
//             const old_y = collider.position.y;
//             collider.position.z = old_y;
//         });
//     }
// });
const a = system.pos.map((timestep, i1) => {
    return timestep.map((body, i2) => {
        return [0.0, 0.0, 0.0];
    });
});
console.log(a);
system.pos = a;

system.config.bodies.push({
    "name": "Target",
    "colliders": [
        {
            "position": {
                "x": 2.0,
                "y": 0.0,
                "z": 0.05
            },
            "sphere": {
                "radius": 0.1
            },
            "material": {
                "friction": 1.0,
                "elasticity": 0.0
            },
            "color": "",
            "hidden": false,
            "noContact": false
        }
    ],
    "inertia": {
        "x": 1.0,
        "y": 1.0,
        "z": 1.0
    },
    "frozen": {
        "position": {
            "x": 1.0,
            "y": 1.0,
            "z": 1.0
        },
        "rotation": {
            "x": 1.0,
            "y": 1.0,
            "z": 1.0
        },
        "all": true
    },
    "mass": 10.0
});
system.pos[0].push([2, 0, 0.05]);
system.rot[0].push([1, 0, 0, 0]);
var viewer = new Viewer(domElement, system);
