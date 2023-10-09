var gl;
var program;
var vPosition;
var bufferId;

// Three vertices
var vertices = [
//        vec2(-0.5,-0.5),
//        vec2(0.5,-0.5),
//        vec2(0,0.5)
];

var MAXTRIS=10000;
var VISIBLE=50;
var SIZE=0.05;

var first = 0;

function addRandomTriangle(v)
{
    var a=vec2((Math.random()-0.5)*2, (Math.random()-0.5)*2);
    var d1=vec2(a[0]+SIZE*(Math.random()-0.5)*2, a[1]+SIZE*(Math.random()-0.5)*2);
    var d2=vec2(a[0]+SIZE*(Math.random()-0.5)*2, a[1]+SIZE*(Math.random()-0.5)*2);
    
    v.push(a);
    v.push(d1);
    v.push(d2);
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
        
    for(var i=0; i<MAXTRIS; i++)
        addRandomTriangle(vertices);
    
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
    first +=1;
    if(first >MAXTRIS-VISIBLE)
        first = 0;
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Associate our shader variables with our data buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLES, 3*first, 3*VISIBLE);

    requestAnimationFrame(render);
}
