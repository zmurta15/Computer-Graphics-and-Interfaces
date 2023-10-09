var gl;

var program;
var program2;
var program3;

var bufferId;
var bufferId1;
var bufferId2;

var vGrid;
var verticesGrid = [];
var pixels = [];
var vTimeSample;
var vTimeSample2;


var total = 0;
var total2 = 0;
const maxSamples = 10000;

var funcLoc, func = 0;
var funcXLoc, funcX =0;
var colorLoc, color = [0.0,0.0,1.0,1.0];
var amplitudeLoc, amplitude = 10;
var secsLoc, secs = 0.05;
var verticalMoveLoc, verticalMove =0;
var phaseLoc, phase = 0;
var timeLoc, time = 0;

var funcLoc2, func2 = 0;
var funcXLoc2, funcX2 = 0;
var colorLoc2, color2 = [1.0,0.0,1.0,1.0];
var amplitudeLoc2, amplitude2 = 10;
var secsLoc2, secs2 = 0.05;
var verticalMoveLoc2, verticalMove2 = 0;
var phaseLoc2, phase2 = 0;
var timeLoc2, time2 = 0;

var b1 = 1;
var b2 = 0;



function initGrid() {
    for(var i = 1.0; i<8.0; i++) {
        verticesGrid.push(vec2(-1.0 , -1.0+i*(1.0/4.0)));
        verticesGrid.push(vec2(1.0 , -1.0+i*(1.0/4.0)));
    }
    for(var j = 1.0; j<12.0; j++) {
        verticesGrid.push(vec2(-1.0+j*(1.0/6.0) , -1.0));
        verticesGrid.push(vec2(-1.0+j*(1.0/6.0) , 1.0));
    }
}

function initPixels() {
    for(var i = 0.0; i<maxSamples; i++) {
        pixels.push(i);
    }
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    initGrid();
    initPixels();

    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    program2 = initShaders(gl, "vertex-shader2", "fragment-shader");
    program3 = initShaders(gl, "vertex-shader2", "fragment-shader");

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesGrid), gl.STATIC_DRAW);

    //Load the data into the GPU
    bufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pixels), gl.STATIC_DRAW);

    //Load the data into the GPU
    bufferId2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pixels), gl.STATIC_DRAW);

    //Get Attribute Location
    vGrid = gl.getAttribLocation(program, "vGrid");
    vTimeSample = gl.getAttribLocation(program2, "vTimeSample");
    vTimeSample2= gl.getAttribLocation(program3, "vTimeSample");
    
    //Vertical select for wave 1
    var m = document.getElementById("vertical");
    m.addEventListener("click", function() {    
        switch (m.selectedIndex) {
            case 0:
                func = 0;
                color = [0.0,0.0,1.0,1.0];
                break;
            case 1:
                func = 1;
                color = [1.0,0.0,0.0,1.0];
                break;
            case 2:
                func = 2;
                color = [0.0,1.0,0.0,1.0];
                break;
        }
    });

    // Vertical select for wave 2
    var m2 = document.getElementById("vertical2");
    m2.addEventListener("click", function() {    
        switch (m2.selectedIndex) {
            case 0:
                func2 = 0;
                color2 = [0.0,255.0,255.0,1.0];
                break;
            case 1:
                func2 = 1;
                color2 = [255.0,0.0,255.0,1.0];
                break;
            case 2:
                func2 = 2;
                color2 = [255.0,255.0,0.0,1.0];
                break;
        }
    });

    //Horizontal Select
    var n = document.getElementById("horizontal");
    n.addEventListener("click", function() {    
        switch (n.selectedIndex) {
            case 0:
                funcX = 0;
                break;
            case 1:
                funcX = 1;
                break;
            case 2:
                funcX = 2;
                break;
            case 3:
                funcX = 3;
                break;
        }
    });

    //Horizontal Select for wave 2
    var n2 = document.getElementById("horizontal2");
    n2.addEventListener("click", function() {    
        switch (n2.selectedIndex) {
            case 0:
                funcX2 = 0;
                break;
            case 1:
                funcX2 = 1;
                break;
            case 2:
                funcX2 = 2;
                break;
            case 3:
                funcX2 = 3;
                break;
        }
    });

    //Initialize volts array for slide
    var arrayVolts = [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0, 200.0, 500.0];
    var vol = document.getElementById("slide1");
    vol.oninput = function() {
        amplitude = arrayVolts[vol.value];
        var voltsPrint = document.getElementById("voltsPrint");
        voltsPrint.innerHTML = amplitude;
    }

    //Slide volts for wave 2
    var vol2 = document.getElementById("slide1_2");
    vol2.oninput = function () {
        amplitude2 = arrayVolts[vol2.value];
        var voltsPrint2 = document.getElementById("voltsPrint2");
        voltsPrint2.innerHTML = amplitude2;
    }

    //Initialize seconds array for slider
    var arraySecs = [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0, 2.0 , 5.0, 10.0];
    var sec = document.getElementById("slide2");
    sec.oninput = function() {
        secs = arraySecs[sec.value];
        var secsPrint = document.getElementById("secsPrint");
        secsPrint.innerHTML = secs;
    }

    //Slide seconds for wave 2
    var sec2 = document.getElementById("slide2_2");
    sec2.oninput = function() {
        secs2 = arraySecs[sec2.value];
        var secsPrint2 = document.getElementById("secsPrint2");
        secsPrint2.innerHTML = secs2;
    }

    //Initialize vertical offset slider
    var verticalAux = document.getElementById("slide3");
    verticalAux.oninput = function() { 
        verticalMove = verticalAux.value; 
    }

    //Initialize vertical off  slider for wave2
    var verticalAux2 = document.getElementById("slide3_2");
    verticalAux2.oninput = function() { 
        verticalMove2 = verticalAux2.value; 
    }

    //Initialize phase slider
    var phaseAux = document.getElementById("slide4");
    phaseAux.oninput = function () {
        phase = phaseAux.value;
    }

    //Initialize phase slider for wave2
    var phaseAux2 = document.getElementById("slide4_2");
    phaseAux2.oninput = function () {
        phase2 = phaseAux2.value;
    }

    var buttonWave1 = document.getElementById("button1");
    buttonWave1.onclick = function() {
        if(b1 == 1) {
            b1 = 0;
        }
        else {
            b1 =1;
        }
    }

    var buttonWave2 = document.getElementById("button2");
    buttonWave2.onclick = function() {
        if(b2 == 1) {
            b2 = 0;
        }
        else {
            b2 =1;
        }
    }
    
    //Initalize 
    funcLoc = gl.getUniformLocation(program2, "func");
    colorLoc = gl.getUniformLocation(program2, "color");
    funcXLoc = gl.getUniformLocation(program2, "funcX");
    amplitudeLoc = gl.getUniformLocation(program2, "amplitude");
    secsLoc = gl.getUniformLocation(program2, "secs");
    verticalMoveLoc = gl.getUniformLocation(program2, "verticalMove");
    phaseLoc = gl.getUniformLocation(program2, "phase");
    timeLoc = gl.getUniformLocation(program2, "time");

    funcLoc2 = gl.getUniformLocation(program3, "func");
    colorLoc2 = gl.getUniformLocation(program3, "color");
    funcXLoc2 = gl.getUniformLocation(program3, "funcX");
    amplitudeLoc2 = gl.getUniformLocation(program3, "amplitude");
    secsLoc2 = gl.getUniformLocation(program3, "secs");
    verticalMoveLoc2 = gl.getUniformLocation(program3, "verticalMove");
    phaseLoc2 = gl.getUniformLocation(program3, "phase");
    timeLoc2 = gl.getUniformLocation(program3, "time");

    render();
}

//
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if(b1 == 1) {
        gl.useProgram(program2);
 
        colorLoc = gl.getUniformLocation(program2, "color");

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
        gl.vertexAttribPointer(vTimeSample, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTimeSample);
    
        gl.uniform1f(funcLoc, func); //to change wave in the vertical axis
        gl.uniform1f(funcXLoc, funcX); //to change wave in the horizontal axis
        gl.uniform1f(amplitudeLoc, amplitude); //to change volts/divs
        gl.uniform1f(secsLoc, secs); //To change secs/divs
        gl.uniform1f(verticalMoveLoc, verticalMove); //To change vertical axis position
        gl.uniform1f(phaseLoc, phase); //To change phase
        gl.uniform1f(timeLoc, time); //To control time
        gl.uniform4fv(colorLoc, color); //To choose color
        
        if(secs*12 > (1/60)) {
            total += (maxSamples/60)/(12*secs);
            var aux = 0;
            if(total > maxSamples) {
                aux = total-maxSamples;
                total = maxSamples;
            }
            gl.drawArrays(gl.LINE_STRIP, 0, total); 
            if(total == maxSamples) {
                total = aux;
                time += secs*12;
            }
        }
        else {
            gl.drawArrays(gl.LINE_STRIP, 0, maxSamples);
            time += 1/60;
        }
      
    }

    if(b2 == 1) {
        gl.useProgram(program3);

        colorLoc = gl.getUniformLocation(program3, "color");

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
        gl.vertexAttribPointer(vTimeSample2, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTimeSample2);
    
        gl.uniform1f(funcLoc2, func2); //to change wave in the vertical axis
        gl.uniform1f(funcXLoc2, funcX2); //to change wave in the horizontal axis
        gl.uniform1f(amplitudeLoc2, amplitude2); //to change volts/divs
        gl.uniform1f(secsLoc2, secs2); //To change secs/divs
        gl.uniform1f(verticalMoveLoc2, verticalMove2); //To change vertical axis position
        gl.uniform1f(phaseLoc2, phase2); //To change phase
        gl.uniform1f(timeLoc2, time2); //To control time
        gl.uniform4fv(colorLoc2, color2); //To choose color

        if(secs2*12 > (1/60)) {
            total2 += (maxSamples/60)/(12*secs2);
            var aux2 = 0;
            if(total2 > maxSamples) {
                aux2 = total2-maxSamples;
                total2 = maxSamples;
            }
            gl.drawArrays(gl.LINE_STRIP, 0, total2); 
            if(total2 == maxSamples) {
                total2 = aux2;
                time2 += secs2*12;
            }
        }
        else {
            gl.drawArrays(gl.LINE_STRIP, 0, maxSamples);
            time2 += 1/60;
         }
    }
    
    gl.useProgram(program);

    var colorLoc1 = gl.getUniformLocation(program, "color");

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.vertexAttribPointer(vGrid, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vGrid);

    gl.uniform4fv(colorLoc1, [1.0, 1.0, 1.0, 1.0]);
    gl.drawArrays(gl.LINES, 0, 36);

    window.requestAnimFrame(render);
}