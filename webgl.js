import { m3 } from "./matrix.js";
import { glutil } from "./glutil.js";

function runGL(gl, vertexShaderSource, fragmentShaderSource, image) {

    glutil.needCanvasResize(gl);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    var vertexShader = glutil.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = glutil.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = glutil.createProgram(gl, vertexShader, fragmentShader);

    const positonAttributeLocationHandler = gl.getAttribLocation(program, "a_position");
    const texCoordAttribute = gl.getAttribLocation(program, "a_texCoord");
    const matrixUniformLocationHandler = gl.getUniformLocation(program, "u_matrix");
    const scaleUniform = gl.getUniformLocation(program, "u_scale");
    const rotationUniform = gl.getUniformLocation(program, "u_angle");
    const inputRatioUniform = gl.getUniformLocation(program, "u_inputRatio");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // 6 2d points
    const points = [
        0, 0,
        0, gl.canvas.height,
        gl.canvas.width, 0,
        gl.canvas.width, 0,
        gl.canvas.width, gl.canvas.height,
        0, gl.canvas.height
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    console.log(gl.canvas.width + ", " + gl.canvas.height);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1
    ]), gl.STATIC_DRAW);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    var angleInRad = document.getElementById("rotation-range").value;
    var horizontalFlip = -1;

    document.getElementById("rotation-range").addEventListener("input", function() {
        angleInRad = this.value - 360.0;
        angleInRad = angleInRad*Math.PI / 180.0;

        drawScene();
    });

    drawScene();

    function drawScene() {
        glutil.needCanvasResize(gl);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positonAttributeLocationHandler);
        gl.vertexAttribPointer(positonAttributeLocationHandler, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);

        gl.enableVertexAttribArray(texCoordAttribute);
        gl.vertexAttribPointer(texCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        var projectionMatrix = m3.projection(gl.canvas.width, gl.canvas.height);

       // var translation = [gl.canvas.width/2, gl.canvas.height/2];
        var scale = [1, 1];
        const canvasRatio = gl.canvas.width/gl.canvas.height;
        const imageRatio = image.width / image.height;

        if(imageRatio/canvasRatio >= 1.0) {
            scale[0] = 1.;
            scale[1] = 1.0/imageRatio/canvasRatio;
        } else {
            scale[0] = imageRatio/canvasRatio;
            scale[1] = 1.;
        }

        gl.uniformMatrix3fv(matrixUniformLocationHandler, false, projectionMatrix);
        gl.uniform2fv(scaleUniform, scale);
        gl.uniform1f(rotationUniform, angleInRad);
        gl.uniform1f(inputRatioUniform, imageRatio);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

async function main() {
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");

    var gl = canvas.getContext("webgl");
    if (!gl) {
      alert("no webgl for you");
      return;
    } else {
      console.log("webgl supported");
    }

    var vertexShaderSource = await fetch('vertex_shader.glsl').then(result => result.text());
    var fragmentShaderSource = await fetch('fragment_shader.glsl').then(result => result.text());

    var image = new Image();
    image.src = "moti_mia.jpg";
    image.onload = function() {
        console.log(image.width + ", " + image.height);

        runGL(gl, vertexShaderSource, fragmentShaderSource, image);
    }
    
}

main();