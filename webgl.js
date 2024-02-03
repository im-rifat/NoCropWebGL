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
        0, gl.canvas.height,
        gl.canvas.width, gl.canvas.height
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1
    ]), gl.STATIC_DRAW);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    var angleInRad = document.getElementById("rotation-range").value;
    var horizontalFlip = -1;

    $("#rotation-range").on("input", function() {
        angleInRad = this.value - 360.0;
        angleInRad = angleInRad*Math.PI / 180.0;

        drawScene();
    });

    $("#canvas_4_3").click(function() {
        scaleToFit(4/3.0);
        drawScene();
    });

    $("#canvas_16_9").click(function() {

        scaleToFit(16/9.0);
        drawScene();
    });

    $("#canvas_9_16").click(function() {

        scaleToFit(9/16.0);
        drawScene();
    });

    $("#canvas_1_1").click(function() {

        scaleToFit(1.0);
        drawScene();
    });

    drawScene();

    function scaleToFit(ratio) {
        let canvasHolder = $("#canvas_holder").get(0);
        let canvas = $("#canvas").get(0);

        if(ratio > 1.0) {
            canvas.style.width = "100%";
            let heightPercentage = (100/ratio);
            canvas.style.height = heightPercentage + "%";
        } else {
            canvas.style.height = "100%";
            let widthPercentage = (canvasHolder.clientHeight*100.0)/canvasHolder.clientWidth * ratio;
            canvas.style.width = widthPercentage + "%";
        }

        glutil.needCanvasResize(gl);
        onCanvasSizeChanged();
    }

    function onCanvasSizeChanged() {

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // 6 2d points
        const points = [
            0, 0,
            0, gl.canvas.height,
            gl.canvas.width, 0,
            gl.canvas.width, 0,
            0, gl.canvas.height,
            gl.canvas.width, gl.canvas.height
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    }

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
        const frameAspect = gl.canvas.width/gl.canvas.height;
        const textureAspect = image.width / image.height;
        const textureFrameRatio = textureAspect/frameAspect;
        const portraitFrame = frameAspect < 1.0;
        const portraitTexture = textureAspect < 1.0;

            if(frameAspect == 1.0) {
                if(portraitTexture) {
                    scale[0] = 1.0/textureFrameRatio;
                } else {
                    scale[1] = textureFrameRatio;
                }
            }

        else if(portraitTexture) {
            if(portraitFrame) {
                scale[1] = textureFrameRatio;
            } else {
                scale[0] = 1.0/textureFrameRatio;
            }
        } else {
            if(portraitFrame) {
                scale[1] = textureFrameRatio;
            } else {
                scale[0] = 1.0/textureFrameRatio;
            }
        }

        gl.uniformMatrix3fv(matrixUniformLocationHandler, false, projectionMatrix);
        gl.uniform2fv(scaleUniform, scale);
        gl.uniform1f(rotationUniform, angleInRad);
        gl.uniform1f(inputRatioUniform, textureAspect);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

async function main() {
    /** @type {HTMLCanvasElement} */
    const canvas = $("#canvas").get(0);

    var gl = canvas.getContext("webgl");
    if (!gl) {
      alert("no webgl for you");
      return;
    }

    var vertexShaderSource = await fetch('vertex_shader.glsl').then(result => result.text());
    var fragmentShaderSource = await fetch('fragment_shader.glsl').then(result => result.text());

    var image = new Image();
    image.src = "moti_mia.jpg";
    image.onload = function() {
        runGL(gl, vertexShaderSource, fragmentShaderSource, image);
    }
    
}

main();