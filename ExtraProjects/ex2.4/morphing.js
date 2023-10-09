var gl;
var program;
var vPosStart, vPosEnd;

const N_VERTICES = 100;
const SPEED = 0.01;

// The vertices
var vertices = [];
var frame = 0;

function generateVertex()
{
    var x = (Math.random() - 0.5)*2;
    var y = (Math.random() - 0.5)*2;
    return vec2(x, y);
}

// Use this function instead of generateVertices in init() to have 2 random shapes
function generateRandomVertices(count)
{
    for(var i=0; i<count; i++) {
        // Generate start position
        vertices.push(generateVertex());
        // Generate end position
        vertices.push(generateVertex());
    }
}

function generateVertices(count)
{
    var angle = 0;
    for(var i=0; i<count; i++) {
        // Generate start position
        vertices.push(generateVertex());
        // Generate end position
        angle += 2*Math.PI/count;
        vertices.push(vec2(Math.cos(angle), Math.sin(angle)));
    }
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    // generate vertex data
    generateVertices(N_VERTICES);

    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    vPosStart = gl.getAttribLocation(program, "vPosStart");
    vPosEnd = gl.getAttribLocation(program, "vPosEnd");

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform4fv(gl.getUniformLocation(program, "color"), [0.0, 0.0, 0.0, 1.0]);
    gl.uniform1f(gl.getUniformLocation(program, "t"), (Math.sin(SPEED*frame-Math.PI/2)+1)/2);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

    // Associate our shader variables with our data buffer
    gl.vertexAttribPointer(vPosStart, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(vPosStart);

    gl.vertexAttribPointer(vPosEnd, 2, gl.FLOAT, false, 16, 8);
    gl.enableVertexAttribArray(vPosEnd);
    gl.drawArrays(gl.LINE_LOOP, 0, N_VERTICES);

    frame++;
    requestAnimFrame(render);
}
