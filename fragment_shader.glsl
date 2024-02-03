precision highp float;

varying vec2 v_texCoord;

uniform sampler2D u_image;
uniform vec2 u_scale;
uniform float u_angle;
uniform float u_inputRatio;

mat2 rotate(float angle) {
    return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
}

void main() {
    vec2 uv = (v_texCoord - vec2(.5));
    uv *= u_scale;

    uv.x *= u_inputRatio;
    uv *= rotate(u_angle);
    uv.x *= (1. / u_inputRatio);

    uv += vec2(.5);

    if(uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.)
        discard;

    gl_FragColor = texture2D(u_image, uv);
}