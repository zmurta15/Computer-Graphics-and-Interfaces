var gl;
var program;
var vPosition;
var bufferId;
var dxLoc;
var time = 0;

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
    
    dxLoc = gl.getUniformLocation(program, "dx");
    
    render();
}

function render() 
{    
    // clear the background
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Choose the program for the animation (the vertex shader of this program applies a displacement) 
    gl.useProgram(program);

    // Send the current displacement value as the output of a sinusoidal function over time with 0.5 amplitude
    gl.uniform1f(dxLoc, 0.5*Math.sin(time));
    time += 1/60;
  
    // Associate our shader variables with our data buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Issue the drawing request
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    
    // This function is provided in the webgl-utils library for retrocompatibility with older browsers
    // If your browser is relatively up to date, it is the same as calling the browser supported function called
    // window.requestAnimationFrame()
    // What it does is to trigger a call to the function given as parameter every time the browser needs to update the page
    // typically every 1/60 of a second. 
    window.requestAnimFrame(render);
}
