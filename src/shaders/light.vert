#version 300 es

// Using these `layout` qualifiers stops us from having to call `gl.getAttribLocation`, since we can
// set the locations ourselves manually. Only works on `in` attributes, not uniforms (in WebGL,
// anyways).
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec4 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjMatrix;

out vec3 vPosition;
out vec4 vColor;

void main() {
    // Get world-space position:
    vec4 wsPos = uModelMatrix * vec4(aPosition, 1.0);
    vPosition = vec3(wsPos.x, wsPos.y, wsPos.z);
    gl_Position = uProjMatrix * uViewMatrix * wsPos;
    vColor = aColor;
}
