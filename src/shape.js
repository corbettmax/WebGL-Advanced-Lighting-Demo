import { mult, translationMatrix, rotationMatrix, scaleMatrix, vec3, vec2, vec4 } from 'mv-redux';
import { Mesh } from './mesh';


/**
 * @typedef ShapeOptions Configuration options for constructing a new shape.
 * @property {import('mv-redux').Vec3} [position]
 * @property {import('mv-redux').Vec3} [scale]
 * @property {import('mv-redux').Vec3} [rotation]
 * @property {import('mv-redux').Vec3} [ambient]
 * @property {import('mv-redux').Vec3} [diffuse]
 * @property {import('mv-redux').Vec3} [specular]
 */


/**
 * A class that wraps the properties of a 3D shape.
 */
export class SceneObject {
    mesh;

    position;
    rotation;
    scale;
    ambient;
    diffuse;
    specular;


    /**
     * @param {Mesh} mesh Which mesh this object should be drawn with.
     * @param {ShapeOptions} [options] Initial parameters for position, rotation, and scale.
     */
    constructor(mesh, options = {}) {
        this.mesh = mesh;

        this.position = options?.position ?? vec3(0, 0, 0);
        this.rotation = options?.rotation ?? vec3(0, 0, 0);
        this.scale = options?.scale ?? vec3(1, 1, 1);

        this.ambient = options?.ambient ?? vec3(1.0, 1.0, 1.0);

        this.ambient.x = 0.25 * this.ambient.x
        this.ambient.y = 0.25 * this.ambient.y
        this.ambient.z = 0.25 * this.ambient.z

        this.diffuse = options?.diffuse ?? vec3(this.ambient.x * 1.2, this.ambient.y * 1.2, this.ambient.z * 1.2);
        this.specular = options?.specular ?? vec3(1.0,1.0,1.0);
    }

    /**
     * Computes this shape's current transformation matrix.
     * @returns {import('mv-redux').Mat4}
     */
    getModelMatrix() {
        const sMat = scaleMatrix(this.scale);
        const tMat = translationMatrix(this.position);

        const rMatX = rotationMatrix('x', this.rotation.x);
        const rMatY = rotationMatrix('y', this.rotation.y);
        const rMatZ = rotationMatrix('z', this.rotation.z);
        const rMat = mult(mult(rMatZ, rMatY), rMatX);

        return mult(mult(tMat, rMat), sMat);
    }
}

/**
 * Generates vertex data for a cube.
 * @returns {Float32Array} The vertex data.
 */
export function generateTexturedCubeVertices(texNum) {
    const faces = [
        [
            // Front (facing camera, towards +z)
            [ vec3(-0.5, +0.5, +0.5), vec3(0, 0, +1) , vec2(0, 1), texNum],
            [ vec3(-0.5, -0.5, +0.5), vec3(0, 0, +1) , vec2(0, 0), texNum],
            [ vec3(+0.5, +0.5, +0.5), vec3(0, 0, +1) , vec2(1, 1), texNum],
            [ vec3(+0.5, -0.5, +0.5), vec3(0, 0, +1) , vec2(1, 0), texNum],
        ],
        [
            // Right (+x)
            [ vec3(+0.5, +0.5, +0.5), vec3(+1, 0, 0) , vec2(1, 1), texNum],
            [ vec3(+0.5, -0.5, +0.5), vec3(+1, 0, 0) , vec2(1, 0), texNum],
            [ vec3(+0.5, +0.5, -0.5), vec3(+1, 0, 0) , vec2(0, 1), texNum],
            [ vec3(+0.5, -0.5, -0.5), vec3(+1, 0, 0) , vec2(0, 0), texNum],
        ],
        [
            // Left (-x)
            [ vec3(-0.5, +0.5, +0.5), vec3(-1, 0, 0) , vec2(1, 1), texNum],
            [ vec3(-0.5, -0.5, +0.5), vec3(-1, 0, 0) , vec2(1, 0), texNum],
            [ vec3(-0.5, +0.5, -0.5), vec3(-1, 0, 0) , vec2(0, 1), texNum],
            [ vec3(-0.5, -0.5, -0.5), vec3(-1, 0, 0) , vec2(0, 0), texNum],
        ],
        [
            // Top (+y)
            [ vec3(-0.5, +0.5, -0.5), vec3(0, +1, 0) , vec2(0, 0), texNum],
            [ vec3(-0.5, +0.5, +0.5), vec3(0, +1, 0) , vec2(0, 1), texNum],
            [ vec3(+0.5, +0.5, -0.5), vec3(0, +1, 0) , vec2(1, 0), texNum],
            [ vec3(+0.5, +0.5, +0.5), vec3(0, +1, 0) , vec2(1, 1), texNum],
        ],
        [
            // Bottom (-y)
            [ vec3(-0.5, -0.5, -0.5), vec3(0, -1, 0) , vec2(0, 0), texNum],
            [ vec3(-0.5, -0.5, +0.5), vec3(0, -1, 0) , vec2(0, 1), texNum],
            [ vec3(+0.5, -0.5, -0.5), vec3(0, -1, 0) , vec2(1, 0), texNum],
            [ vec3(+0.5, -0.5, +0.5), vec3(0, -1, 0) , vec2(1, 1), texNum],
        ],
        [
            // Rear (-z)
            [ vec3(-0.5, +0.5, -0.5), vec3(0, 0, -1) , vec2(0, 1), texNum],
            [ vec3(-0.5, -0.5, -0.5), vec3(0, 0, -1) , vec2(0, 0), texNum],
            [ vec3(+0.5, +0.5, -0.5), vec3(0, 0, -1) , vec2(1, 1), texNum],
            [ vec3(+0.5, -0.5, -0.5), vec3(0, 0, -1) , vec2(1, 0), texNum],
        ],
    ];
        // Quad vertices to double-triangle vertices:
    // [ 1, 2, 3, 4 ] --> [ 1, 2, 3 ] [ 4, 3, 2 ]
    // Duplicate the 3rd and 2nd vertices.
    for (const face of faces) {
        face.push(face[2], face[1]);
    }

    // Now we can flatten it all down.
    return new Float32Array(faces.flat(3));
}

/**
 * Generates vertex data for a cube.
 * @returns {Float32Array} The vertex data.
 */
export function generateColoredCubeVertices(color) {
    const faces = [
        [
            // Front (facing camera, towards +z)
            [ vec3(-0.5, +0.5, +0.5), color],
            [ vec3(-0.5, -0.5, +0.5), color],
            [ vec3(+0.5, +0.5, +0.5), color],
            [ vec3(+0.5, -0.5, +0.5), color],
        ],
        [
            // Right (+x)
            [ vec3(+0.5, +0.5, +0.5), color],
            [ vec3(+0.5, -0.5, +0.5), color],
            [ vec3(+0.5, +0.5, -0.5), color],
            [ vec3(+0.5, -0.5, -0.5), color],
        ],
        [
            // Left (-x)
            [ vec3(-0.5, +0.5, +0.5), color],
            [ vec3(-0.5, -0.5, +0.5), color],
            [ vec3(-0.5, +0.5, -0.5), color],
            [ vec3(-0.5, -0.5, -0.5), color],
        ],
        [
            // Top (+y)
            [ vec3(-0.5, +0.5, -0.5), color],
            [ vec3(-0.5, +0.5, +0.5), color],
            [ vec3(+0.5, +0.5, -0.5), color],
            [ vec3(+0.5, +0.5, +0.5),color],
        ],
        [
            // Bottom (-y)
            [ vec3(-0.5, -0.5, -0.5), color],
            [ vec3(-0.5, -0.5, +0.5), color],
            [ vec3(+0.5, -0.5, -0.5), color],
            [ vec3(+0.5, -0.5, +0.5), color],
        ],
        [
            // Rear (-z)
            [ vec3(-0.5, +0.5, -0.5), color],
            [ vec3(-0.5, -0.5, -0.5), color],
            [ vec3(+0.5, +0.5, -0.5), color],
            [ vec3(+0.5, -0.5, -0.5), color],
        ],
    ];

    // Quad vertices to double-triangle vertices:
    // [ 1, 2, 3, 4 ] --> [ 1, 2, 3 ] [ 4, 3, 2 ]
    // Duplicate the 3rd and 2nd vertices.
    for (const face of faces) {
        face.push(face[2], face[1]);
    }

    // Now we can flatten it all down.
    return new Float32Array(faces.flat(3));
}
