#version 300 es

precision highp float;

in vec4 vPosition;
in vec3 vNormal;
in vec2 vTexCoord;
in float vMatIndex;

uniform mat4 uViewMatrix;
uniform int i;

out vec4 fColor;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
    sampler2D diffuse2;
    sampler2D specular2;
    float shininess2;
};
struct Light {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    vec3 position;
};

uniform Material uMaterial;
uniform Light uLight1;
uniform Light uLight2;
uniform Light uLight3;


vec3 blinnPhong(sampler2D diffuse, sampler2D specular, float shininess, Light light) {
    //ambient
    vec3 amb = light.ambient * texture(diffuse, vTexCoord).rgb;
    
    vec3 l = normalize(light.position - vPosition.xyz); // Position -> Light
    vec3 n = normalize(vNormal);                    // Surface normal
    float Kd = max(dot(n, l), 0.0);
    //from diffuse map
    vec3 diff = light.diffuse * Kd * texture(diffuse, vTexCoord).rgb;

    vec3 v =  - vPosition.xyz + normalize(vec3(inverse(uViewMatrix)[3])); // Camera -> Position
    vec3 h = normalize( l + v );

    float Ks = dot(l, n) > 0.0 ? pow(max(dot(n, h), 0.0), shininess) : 0.0;
    //from specular map
    vec3 spec = light.specular * Ks * texture(specular, vTexCoord).rgb;

   

    return amb + diff + spec;
}

void main() {
    vec4 c[7];
    if (vMatIndex==0.0) c[0] = vec4(blinnPhong(uMaterial.diffuse, uMaterial.specular, 
    uMaterial.shininess , uLight1) + blinnPhong(uMaterial.diffuse, 
    uMaterial.specular, uMaterial.shininess , uLight2) +
    blinnPhong(uMaterial.diffuse, uMaterial.specular, uMaterial.shininess , uLight3), 1);


    else c[0] = vec4(blinnPhong(uMaterial.diffuse2, uMaterial.specular2,
     uMaterial.shininess2 , uLight1) + blinnPhong(uMaterial.diffuse2, uMaterial.specular2,
     uMaterial.shininess2 , uLight2)+ blinnPhong(uMaterial.diffuse2, uMaterial.specular2,
     uMaterial.shininess2 , uLight3),  1);

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
