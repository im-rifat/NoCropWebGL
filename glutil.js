const glutil = {
    "NO_TEXTURE": -1,

    loadShader: function(gl, type, src) {
        var shaderId = gl.createShader(type);
        gl.shaderSource(shaderId, src);
        gl.compileShader(shaderId);
        var success = gl.getShaderParameter(shaderId, gl.COMPILE_STATUS);
    
        if(success) {
            return shaderId;
        }
    
        alert('Unable to create shader for ' + gl.getShaderInfoLog(shaderId));
        gl.deleteShader(shaderId);
    },

    createProgram: function(gl, vertexShader, fragmentShader) {
        const programId = gl.createProgram();
        gl.attachShader(programId, vertexShader);
        gl.attachShader(programId, fragmentShader);
    
        gl.linkProgram(programId);
    
        if(gl.getProgramParameter(programId, gl.LINK_STATUS)) {
            return programId;
        }
    
        alert(gl.getProgramInfoLog(programId));
        gl.deleteProgram(programId);
    },

    createBuffer: function(gl, data) {
        const buffer = gl.createBuffer();
        this.updateBufferData(gl, buffer, data);

        return buffer;
    },

    updateBufferData: function(gl, bufferId, data) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    },

    loadTexture: function(gl, texId, imageData) {
        const id = [texId];
        if(texId == this.NO_TEXTURE) {
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
        
            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
            id[0] = tex;
        } else {
            gl.bindTexture(gl.TEXTURE_2D, texId);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
            id[0] = texId;
        }

        return id[0];
    },

    needCanvasResize: function(gl) {
        const canvas = gl.canvas;

        const dpr = window.devicePixelRatio;
    
        const dw = Math.round(canvas.clientWidth * dpr);
        const dh = Math.round(canvas.clientHeight * dpr);
    
        var need = dw != canvas.width || dh != canvas.height;
    
        if(need) {
            canvas.width = dw;
            canvas.height = dh;
        }
    }
};

export {glutil}