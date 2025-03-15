import { compileShader, initCanvas, linkProgram } from 'mv-redux/init';
import { lookAtMatrix, perspectiveMatrix,normalMatrix, radians, vec3, vec4 } from 'mv-redux';

import vertSource from './shaders/shaded.vert';
import fragSource from './shaders/shaded.frag';

import lightvertSource from './shaders/light.vert';
import lightfragSource from './shaders/light.frag';

import { generateColoredCubeVertices, generateTexturedCubeVertices, SceneObject } from './shape';
import { Mesh } from './mesh';
import { menu } from './menu';


// ------------------------------

/**
 * Fetches an image from a URL and returns a promise that resolves once the image has loaded.
 * @param {URL} url
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = (_event) => resolve(image);
        image.onerror = (_event, _source, _lineno, _colno, err) => reject(err);
        image.src = url.href;
    });
}

function createSolidTexture(gl, r, g, b, a) {
    var data = new Uint8Array([r, g, b, a]);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return texture;
}

// ------------------------------

const F32 = Float32Array.BYTES_PER_ELEMENT;

const canvas = document.querySelector('canvas');
const gl = initCanvas(canvas);

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.1, 0.1, 1.0);
gl.enable(gl.DEPTH_TEST);

// Program and uniforms
// --------------------



const vs = compileShader(gl, gl.VERTEX_SHADER, vertSource);
const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
const shadedProgram = linkProgram(gl, vs, fs)

gl.useProgram(shadedProgram);
const textureShader = {
    program: shadedProgram,
    uModelLocation : gl.getUniformLocation(shadedProgram, 'uModelMatrix'),
    uViewLocation : gl.getUniformLocation(shadedProgram, 'uViewMatrix'),
    uProjLocation : gl.getUniformLocation(shadedProgram, 'uProjMatrix'),
    uNormMatLocation : gl.getUniformLocation(shadedProgram, 'uNormalMatrix'),
    uMaterial : {
    diffuse: gl.getUniformLocation(shadedProgram, 'uMaterial.diffuse'),
    specular: gl.getUniformLocation(shadedProgram, 'uMaterial.specular'),
    diffuse2: gl.getUniformLocation(shadedProgram, 'uMaterial.diffuse2'),
    specular2: gl.getUniformLocation(shadedProgram, 'uMaterial.specular2'),
    shininess: gl.getUniformLocation(shadedProgram, 'uMaterial.shininess'),
    shininess2: gl.getUniformLocation(shadedProgram, 'uMaterial.shininess2'),
    },
    uLight1 : {
    ambient: gl.getUniformLocation(shadedProgram, 'uLight1.ambient'),
    diffuse: gl.getUniformLocation(shadedProgram, 'uLight1.diffuse'),
    specular: gl.getUniformLocation(shadedProgram, 'uLight1.specular'),
    position: gl.getUniformLocation(shadedProgram, 'uLight1.position'),
    },
    uLight2 : {
        ambient: gl.getUniformLocation(shadedProgram, 'uLight2.ambient'),
        diffuse: gl.getUniformLocation(shadedProgram, 'uLight2.diffuse'),
        specular: gl.getUniformLocation(shadedProgram, 'uLight2.specular'),
        position: gl.getUniformLocation(shadedProgram, 'uLight2.position'),
    },
    uLight3 : {
        ambient: gl.getUniformLocation(shadedProgram, 'uLight3.ambient'),
        diffuse: gl.getUniformLocation(shadedProgram, 'uLight3.diffuse'),
        specular: gl.getUniformLocation(shadedProgram, 'uLight3.specular'),
        position: gl.getUniformLocation(shadedProgram, 'uLight3.position'),
    }
}


const lightvs = compileShader(gl, gl.VERTEX_SHADER, lightvertSource);
const lightfs = compileShader(gl, gl.FRAGMENT_SHADER, lightfragSource);
const lightingProgram = linkProgram(gl, lightvs, lightfs);

gl.useProgram(lightingProgram);
const solidShader = {
    program: lightingProgram,
    uModelLocation : gl.getUniformLocation(lightingProgram, 'uModelMatrix'),
    uViewLocation : gl.getUniformLocation(lightingProgram, 'uViewMatrix'),
    uProjLocation : gl.getUniformLocation(lightingProgram, 'uProjMatrix'),
    uNormMatLocation : gl.getUniformLocation(lightingProgram, 'uNormalMatrix'),

    uLight : {
    ambient: gl.getUniformLocation(lightingProgram, 'uLight.ambient'),
    diffuse: gl.getUniformLocation(lightingProgram, 'uLight.diffuse'),
    position: gl.getUniformLocation(lightingProgram, 'uLight.position'),
    }
}


// Mesh and object definitions
// ---------------------------

let spinEnabled = false;
let growEnabled = false;
let twirllights= true;

/** @type {SceneObject[] | undefined} */
let models = undefined; // Set when model is loaded

function draw(time = 0) {

    if (models && growEnabled) {
        models[0].scale = vec3(Math.cos(time / 2000) * 0.5 + 1.0);
    }

    if (models && spinEnabled) {
        models[0].rotation.y += 0.01;
    }

    if (models && twirllights){
        models[2].position.y =  vec3(Math.sin(time / 2000) * 4.5 + 1.0).x;
        models[2].position.z =  vec3(Math.cos(time / 2000) * 4.5 + 1.0).x;

        models[3].position.x =  vec3(Math.sin(time / 200) * 4.5 + 1.0).x;
        models[3].position.z =  vec3(Math.cos(time / 200) * 4.5 + 1.0).x;
    }

    // ==========================================================
    // Send lighting and material uniforms:
    // ==========================================================

    // Camera Variables
    const cameraPosition = menu.cameraPosition;
    const cameraTarget = vec3(0, 0, 0);
    const viewMatrix = lookAtMatrix(cameraPosition, cameraTarget);
    const projMatrix = perspectiveMatrix(radians(45), canvas.width / canvas.height, 0.1, 100);

    // -------------------------------------------------------
    // Pass data to texture shader

    gl.useProgram(shadedProgram);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.uniformMatrix4fv(textureShader.uViewLocation, false, viewMatrix.flat());
    gl.uniformMatrix4fv(textureShader.uProjLocation, false, projMatrix.flat());

    gl.uniform1i(textureShader.uMaterial.diffuse, 0);
    gl.uniform1i(textureShader.uMaterial.specular, 1);
    gl.uniform1i(textureShader.uMaterial.diffuse2, 2);
    gl.uniform1i(textureShader.uMaterial.specular2, 3);
    gl.uniform1f(textureShader.uMaterial.shininess, menu.materialShininess);
    gl.uniform1f(textureShader.uMaterial.shininess2, menu.materialShininess);

    // -------------------------------------------------------
    // Pass data to solid shader

    gl.useProgram(lightingProgram);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(solidShader.uViewLocation, false, viewMatrix.flat());
    gl.uniformMatrix4fv(solidShader.uProjLocation, false, projMatrix.flat());


    
    if (models) {
        models[1].position = menu.lightPosition;

        gl.useProgram(shadedProgram);
        // Light 1
        gl.uniform3fv(textureShader.uLight1.ambient, menu.lightAmbient);
        gl.uniform3fv(textureShader.uLight1.diffuse, menu.lightDiffuse);
        gl.uniform3fv(textureShader.uLight1.specular, menu.lightSpecular);
        gl.uniform3fv(textureShader.uLight1.position, menu.lightPosition);

        // Light 2
        gl.uniform3fv(textureShader.uLight2.ambient, models[2].ambient);
        gl.uniform3fv(textureShader.uLight2.diffuse, models[2].diffuse);
        gl.uniform3fv(textureShader.uLight2.specular, models[2].specular);
        gl.uniform3fv(textureShader.uLight2.position, models[2].position);

        // Light 3
        gl.uniform3fv(textureShader.uLight3.ambient, models[3].ambient);
        gl.uniform3fv(textureShader.uLight3.diffuse, models[3].diffuse);
        gl.uniform3fv(textureShader.uLight3.specular, models[3].specular);
        gl.uniform3fv(textureShader.uLight3.position, models[3].position);


        for (const model of models){

            gl.useProgram(model.mesh.shaderprogram.program);

            const modelMatrix = model.getModelMatrix();

            gl.uniformMatrix4fv(model.mesh.shaderprogram.uModelLocation, false, modelMatrix.flat());
    
            const normalMat = normalMatrix(modelMatrix, true)
            gl.uniformMatrix3fv(model.mesh.shaderprogram.uNormMatLocation, false, normalMat.flat())
    
            model.mesh.draw();
        }
    }

    // ==========================================================

    window.requestAnimationFrame(draw);
}

draw();


// Textures

const cratediffuseTexture = {
    Url: new URL('./textures/container2.png', import.meta.url),
    TextNum: gl.TEXTURE0,
    TextIndex: 0
}

const cratespecularTexture = {
    Url: new URL('./textures/container2_specular.png', import.meta.url),
    TextNum: gl.TEXTURE1,
    TextIndex: 1
}

const brickdiffuseTexture = {
    Url: new URL('./textures/brick-surface-blur.png', import.meta.url),
    TextNum: gl.TEXTURE2,
    TextIndex: 2
}

const brickspecularTexture = {
    Url: new URL('./textures/tiled-brick-specular.png', import.meta.url),
    TextNum: gl.TEXTURE3,
    TextIndex: 3
}


const numTriangles = 12;
const numVerts = numTriangles * 3;
const modelMesh = new Mesh(gl, textureShader, [cratediffuseTexture, cratespecularTexture], null, generateTexturedCubeVertices(0.0), numVerts, [
    { size: 3, type: gl.FLOAT, stride: 9 * F32, offset: 0 * F32 }, // Position
    { size: 3, type: gl.FLOAT, stride: 9 * F32, offset: 3 * F32 }, // Normal
    { size: 2, type: gl.FLOAT, stride: 9 * F32, offset: 6 * F32},  // Texture Coords
    { size: 1, type: gl.FLOAT, stride: 9 * F32, offset: 8 * F32},  // Texture index

]);
const brickMesh = new Mesh(gl, textureShader, [brickdiffuseTexture, brickspecularTexture], null, generateTexturedCubeVertices(1.0), numVerts, [
    { size: 3, type: gl.FLOAT, stride: 9 * F32, offset: 0 * F32 }, // Position
    { size: 3, type: gl.FLOAT, stride: 9 * F32, offset: 3 * F32 }, // Normal
    { size: 2, type: gl.FLOAT, stride: 9 * F32, offset: 6 * F32},  // Texture Coords
    { size: 1, type: gl.FLOAT, stride: 9 * F32, offset: 8 * F32},  // Texture index
]);

const lightMesh1 = new Mesh(gl, solidShader, null, null, generateColoredCubeVertices(vec4(1.0,1.0,1.0,1.0)), numVerts, [
    { size: 3, type: gl.FLOAT, stride: 7 * F32, offset: 0 * F32 }, // Position
    { size: 4, type: gl.FLOAT, stride: 7 * F32, offset: 3 * F32 }, // Color
])

const lightMesh2 = new Mesh(gl, solidShader, null, null, generateColoredCubeVertices(vec4(0.5,1.0,0.5,1.0)), numVerts, [
    { size: 3, type: gl.FLOAT, stride: 7 * F32, offset: 0 * F32 }, // Position
    { size: 4, type: gl.FLOAT, stride: 7 * F32, offset: 3 * F32 }, // Color
])
const lightMesh3 = new Mesh(gl, solidShader, null, null, generateColoredCubeVertices(vec4(1.0,0.5,0.5,1.0)), numVerts, [
    { size: 3, type: gl.FLOAT, stride: 7 * F32, offset: 0 * F32 }, // Position
    { size: 4, type: gl.FLOAT, stride: 7 * F32, offset: 3 * F32 }, // Color
])


models = [];

//crate
models.push(new SceneObject(modelMesh, {
    position: vec3(0, -1, 0), // shift down a bit
    scale: vec3(3,2,2)
}));

//lights
models.push(new SceneObject(lightMesh1, {
    position: vec3(4, 4, 4), // shift
}));
models.push(new SceneObject(lightMesh2, {
    position: vec3(-4, 5, 5), // shift
    ambient: vec3(0.0, 0.5, 0.0),
    diffuse: vec3(0.0, 0.5, 0.0),
    specular: vec3(0.0, 1.0, 0.0)
}));
models.push(new SceneObject(lightMesh3, {
    position: vec3(5, 4, -4), // shift
    ambient: vec3(0.5,0.0,0.0),
    diffuse: vec3(0.5, 0.0, 0.0),
    specular: vec3(1.0, 0.0, 0.0)
}));

// Brick floor
models.push(new SceneObject(brickMesh, {
    position: vec3(2, -2.5, 0), // shift below crate
    scale: vec3(4,1,4)
}));
models.push(new SceneObject(brickMesh, {
    position: vec3(-2, -2.5, 0), // shift below crate
    scale: vec3(4,1,4)
}));



var data = new Uint8Array([255,255,255,1]);
var colortexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, colortexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);



// Allocate a frame buffer object
const framebuffer = gl.createRenderbuffer();
gl.bindRenderbuffer( gl.RENDERBUFFER, framebuffer);
// Attach color buffer
//gl.renderbufferTexture2D(gl.FRAMEBUFFER,
//gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colortexture, 0);
gl.bindRenderbuffer(gl.RENDERBUFFER, null);

// check for completeness
//var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
//if(status != gl.FRAMEBUFFER_COMPLETE) alert('Frame Buffer Not Complete');




/* Here's where I couldn't get the color picking to work.
* I'm fine with taking the loss on the mark, I just wanted to show that I tried really hard
* to do it :(
*
* I tried without the framebuffer too, but the readpixels functions only ever returns 0,0,0,0 for
* its color values. I got stuck down a huge rabbit hole and I decided it might be best to just hand in what 
* I have and do the final assignment instead.
*/
canvas.addEventListener("mousedown", function(event){


    const cameraPosition = menu.cameraPosition;
    const cameraTarget = vec3(0, 0, 0);
    const viewMatrix = lookAtMatrix(cameraPosition, cameraTarget);
    const projMatrix = perspectiveMatrix(radians(45), canvas.width / canvas.height, 0.1, 100);

    gl.bindRenderbuffer(gl.RENDERBUFFER, framebuffer);
    for(var i=0; i<models.length; i++) {
        gl.useProgram(models[i].mesh.shaderprogram.program);
        gl.uniformMatrix4fv(models[i].mesh.shaderprogram.uViewLocation, false, viewMatrix.flat());
        gl.uniformMatrix4fv(models[i].mesh.shaderprogram.uProjLocation, false, projMatrix.flat());
        const modelMatrix = models[i].getModelMatrix();

        gl.uniformMatrix4fv(models[i].mesh.shaderprogram.uModelLocation, false, modelMatrix.flat());
    
        const normalMat = normalMatrix(modelMatrix, true)
        gl.uniformMatrix3fv(models[i].mesh.shaderprogram.uNormMatLocation, false, normalMat.flat())
        gl.uniform1i(gl.getUniformLocation(models[i].mesh.shaderprogram.program, "i"), i+1);
        gl.bindVertexArray(models[i].mesh.vao);
        gl.drawArrays(gl.TRIANGLES, 36*i, 36);
        gl.bindVertexArray(null);
        
    }
    // Get coordinates of mouse pick
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const x = mouseX;
    const y = rect.bottom - rect.top - mouseY - 1;

    const color = new Uint8Array(4)

    //gl.finish();

    gl.readPixels(x, y, 1, 1, gl.RGBA, 
    gl.UNSIGNED_BYTE, color);

    if(color[0]==255)
        if(color[1]==255) console.log("yellow");
        else if(color[2]==255) console.log("magenta");
        else console.log(color);
       else if(color[1]==255)
        if(color[2]==255) console.log("cyan");
        else console.log("green");
        else if(color[2]==255) console.log("blue");
        else console.log(color, x, y);	

    // return to default framebuffer      
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    //send index 0 to fragment shaders
    gl.useProgram(shadedProgram);
    gl.uniform1i(gl.getUniformLocation(shadedProgram, "i"), 0);
    gl.useProgram(lightingProgram);
    gl.uniform1i(gl.getUniformLocation(lightingProgram, "i"), 0);
    
    gl.enable(gl.DEPTH_TEST);
    //draw();
}); 