precision mediump float;

attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform mat3 u_matrix;
varying vec2 v_texCoord;

void main() {
    vec2 clip_space = (u_matrix * vec3(a_position, 1.0)).xy;
    v_texCoord = a_texCoord;
    gl_Position = vec4(clip_space, 0.0, 1.0);
}