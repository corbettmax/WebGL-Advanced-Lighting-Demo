import {loadImage} from "./main.js"


/**
 * @typedef VertexAttribute
 * @property {number} size The amount of {@linkcode type} elements within this attribute.
 * @property {GLenum} type Which datatype this attribute is made of (`gl.FLOAT`, `gl.INT`, etc.).
 * @property {number} stride How far apart, in **bytes,** each instance of this attribute is.
 * @property {number} offset How wide, in **bytes,** this attribute is in its final buffer.
 */

/**
 * A thin wrapper class that holds a buffer of vertex data and a VAO with their attributes.
 */
export class Mesh {
    gl;
    vao;
    shaderprogram;

    vertexData;
    vertexBuffer;
    vertexAttributes;

    vertexCount;

    /**
     * @type {GLenum} Which of `gl.TRIANGLES`, `gl.TRIANGLE_STRIP`, etc., this object should use.
     * Defaults to `gl.TRIANGLES`.
     */
    drawingMode;

    /**
     * @param {WebGL2RenderingContext} gl The WebGL context within which this mesh should create its
     * buffers and VAOs.
     *
     * @param {Float32Array} vertexData A `Float32Array` or similar built-in "TypedArray"
     * containing raw vertex data.
     *
     * @param {number} vertexCount The number of vertices held within {@linkcode vertexData}.
     *
     * @param {VertexAttribute[]} attributes An array of {@link VertexAttribute} objects that
     * explains how the elements of {@link data} should be drawn. Order of this array is important;
     * the first one configures vertex attribute 0, the second vertex attribute 1, and so on.
     */
    constructor(gl, shaderprogram, textures, colorbuffer, vertexData, vertexCount, attributes) {
        this.gl = gl;
        this.shaderprogram = shaderprogram;
        this.vertexData = vertexData;
        this.vertexCount = vertexCount;
        this.vertexAttributes = attributes;
        this.textures = textures;
        this.colorbuffer = colorbuffer;

        this.drawingMode = gl.TRIANGLES;

        gl.useProgram(shaderprogram.program);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

        for (let i = 0; i < attributes.length; i++) {
            gl.vertexAttribPointer(
                 i,
                attributes[i].size,
                attributes[i].type,
                false,
                attributes[i].stride,
                attributes[i].offset,
            );
            gl.enableVertexAttribArray(i);
        }

        // Load Textures
        if(this.textures != null){
            for(const text of this.textures){
                loadImage(text.Url).then(image => {
                
                    const texture = gl.createTexture();
                    gl.activeTexture(text.TextNum);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    gl.generateMipmap(gl.TEXTURE_2D);
                
                    // Only one of these will look correct!
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                
                });
            }
        }


        // Frame Buffer


        // Unbind our VAO to prevent outside code from accidentally modifying our vertex attributes.
        gl.bindVertexArray(null);
    }

    /**
     * Draws this mesh.
     */
    draw() {
        const gl = this.gl;

        gl.useProgram(this.shaderprogram.program);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(this.drawingMode, 0, this.vertexCount);

        // Unbind our VAO to prevent outside code from accidentally modifying our vertex attributes.
        gl.bindVertexArray(null);
    }
}
