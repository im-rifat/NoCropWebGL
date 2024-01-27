const glutil = {
    createShader: function(gl, type, src) {
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