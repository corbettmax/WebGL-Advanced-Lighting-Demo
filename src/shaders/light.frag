#version 300 es

precision highp float;

in vec3 vPosition;
in vec4 vColor;

uniform mat4 uViewMatrix;
uniform int i;

out vec4 fColor;


void main() {
    vec4 c[7];
    c[0] = vColor;
    c[1] = vec4(1.0, 0.0, 0.0, 1.0);
    c[2] = vec4(0.0, 1.0, 0.0, 1.0);
    c[3] = vec4(0.0, 0.0, 1.0, 1.0);
    c[4] = vec4(1.0, 1.0, 0.0, 1.0);
    c[5] = vec4(0.0, 1.0, 1.0, 1.0);
    c[6] = vec4(1.0, 0.0, 1.0, 1.0);

    if(i==0) fColor = c[0];
    else if(i==1) fColor = c[1];
    else if(i==2) fColor = c[2];
    else if(i==3) fColor = c[3];
    else if(i==4) fColor = c[4];
    else if(i==5) fColor = c[5];
    else if(i==6) fColor = c[6];
}
