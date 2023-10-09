var gl;
var program;
var vPosition, vColor;
var bufferId;

var instances=[];

var tx, ty, rz, sx, sy;
var ctmLoc;

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
    
    // Three colors
    var colors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0)
    ];

    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    ctmLoc = gl.getUniformLocation(program, "ctm");

    // Load the (position and color) data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, colors.length * (sizeof['vec3'] + sizeof['vec2']), gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    gl.bufferSubData(gl.ARRAY_BUFFER, colors.length * sizeof['vec2'], flatten(colors));

    //Associate our shader (position) variable with our data buffer
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //Associate our shader (position) variable with our data buffer
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 24);
    gl.enableVertexAttribArray(vColor);

    //buton
    document.getElementById("store").onclick=function() {
        instances.push(mat4());
        tx.value = ty.value = 0;
        rz.value = 0;
        sx.value = sy.value = 1;
        build_ctm();
    }

    tx = document.getElementById("tx");
    tx.oninput = build_ctm;
    ty = document.getElementById("ty");
    ty.oninput = build_ctm;
    rz = document.getElementById("rz");
    rz.oninput = build_ctm;
    sx = document.getElementById("sx");
    sx.oninput = build_ctm;
    sy = document.getElementById("sy");
    sy.oninput = build_ctm;
    
    instances.push(mat4())

    render();
}

function build_ctm() {
    var t_x = parseFloat(tx.value);
    var t_y = parseFloat(ty.value);
    var r_z = parseFloat(rz.value);
    var s_x = parseFloat(sx.value);
    var s_y = parseFloat(sy.value);

    instances[instances.length-1] = mult(translate([t_x, t_y,0]), mult(rotateZ(r_z),  scalem([s_x, s_y,1])));
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Associate our shader (position) variables with our data buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Associate our shader (color) variables with our data buffer
    //gl.bindBuffer(gl.ARRAY_BUFFER, bufferId); // Not really needed since it is the same buffer
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 24);
    gl.enableVertexAttribArray(vColor);

    //Draw stored primitives
    for(const t of instances) {
        gl.uniformMatrix4fv(ctmLoc, false, flatten(t));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    window.requestAnimationFrame(render);
}
