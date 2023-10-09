var gl;

var program;

var bufferId;

var vTimeSample;
var vertices = [];
const maxSamples = 10000;

var funcLoc, func = 1;

function initTimeSample() {
    for(var i = 0.0; i<maxSamples; i++) {
        vertices.push(i);
    }
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    initTimeSample();
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vTimeSample = gl.getAttribLocation(program, "vTimeSample");
    gl.vertexAttribPointer(vTimeSample, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTimeSample);

    funcLoc = gl.getUniformLocation(program, "func");
    gl.uniform1f(funcLoc, func);

    render();
}

function render() {
    window.requestAnimationFrame(render);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.LINE_STRIP, 0, maxSamples);

}