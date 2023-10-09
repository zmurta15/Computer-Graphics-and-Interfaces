var gl;

var program;
var color;

var bufferId;

var vPosition;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // Three vertices
    var vertices = [
        vec2(-0.5,-0.5),
        vec2(0.5,-0.5),
        vec2(0,0.5)
    ];
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");


    render();
}

function render() {
    // clear the background
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var colorLoc = gl.getUniformLocation(program, "color");
    
    // switch to program
    gl.useProgram(program);

    // Associate our shader variables with our data buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.uniform4fv(colorLoc, [1.0, 0.0, 0.0, 1.0]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.uniform4fv(colorLoc, vec4(0.0, 1.0, 0.0, 1.0));
    gl.drawArrays(gl.LINE_LOOP, 0, 3);


}