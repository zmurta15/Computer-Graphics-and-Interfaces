//const WIREFRAME = 0, SOLID = 1;
//const CUBE = 0, SPHERE = 1;

var canvas;
var gl;
var program;
//var mode =  WIREFRAME;
//var animation = true;

var aspect;

var mProjectionLoc, mModelViewLoc;

var time = 0;
//var speed = 10;

var matrixStack = [];
var modelView;


// Stack related operations
function pushMatrix() {
    var m =  mat4(modelView[0], modelView[1],
           modelView[2], modelView[3]);
    matrixStack.push(m);
}
function popMatrix() {
    modelView = matrixStack.pop();
}
// Append transformations to modelView
function multMatrix(m) {
    modelView = mult(modelView, m);
}
function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}
function multScale(s) { 
    modelView = mult(modelView, scalem(s)); 
}
function multRotationX(angle) {
    modelView = mult(modelView, rotateX(angle));
}
function multRotationY(angle) {
    modelView = mult(modelView, rotateY(angle));
}
function multRotationZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

/*
var drawFuncs = [
    [cubeDrawWireFrame, sphereDrawWireFrame],
    [cubeDrawFilled, sphereDrawFilled]
];

//drawPrimitive fancy nao era preciso nada disto
function drawPrimitive(obj, mode, program) {
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    drawFuncs[mode][obj](gl , program);
}*/

function fit_canvas_to_window()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0,canvas.width, canvas.height);

}

window.onresize = function () {
    fit_canvas_to_window();
}

window.onload = function() {
    canvas = document.getElementById('gl-canvas');

    gl = WebGLUtils.setupWebGL(document.getElementById('gl-canvas'));
    fit_canvas_to_window();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, 'default-vertex', 'default-fragment');

    gl.useProgram(program);

    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");

    sphereInit(gl);

    render();
}

const PLANET_SCALE = 10;
const ORBIT_SCALE = 1/60;

const SUN_DIAMETER = 1391900;
const SUN_DAY = 24.47; // At the equator. The poles are slower as the sun is gaseous

const MERCURY_DIAMETER = 4866*PLANET_SCALE;
const MERCURY_ORBIT = 57950000*ORBIT_SCALE;
const MERCURY_YEAR = 87.97;
const MERCURY_DAY = 58.646;

const VENUS_DIAMETER = 12106*PLANET_SCALE;
const VENUS_ORBIT = 108110000*ORBIT_SCALE;
const VENUS_YEAR = 224.70;
const VENUS_DAY = 243.018;

const EARTH_DIAMETER = 12742*PLANET_SCALE;
const EARTH_ORBIT = 149570000*ORBIT_SCALE;
const EARTH_YEAR = 365.26;
const EARTH_DAY = 0.99726968;

const MOON_DIAMETER = 3474 * PLANET_SCALE;
const MOON_ORBIT = 363396;
const MOON_YEAR = 28;
const MOON_DAY = 0;

const VP_DISTANCE = EARTH_ORBIT;

function Earth() {
    multScale([EARTH_DIAMETER, EARTH_DIAMETER, EARTH_DIAMETER]);
    multRotationY(time/EARTH_DAY* 24) ;
    //EARTH
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    sphereDrawWireFrame(gl, program);
}

function Moon() {
    multScale([MOON_DIAMETER, MOON_DIAMETER, MOON_DIAMETER]);
    //MOON
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    sphereDrawWireFrame(gl, program);
}

function EarthAndMoon() {
    pushMatrix();
        Earth();
    popMatrix();
    pushMatrix();
        //pensa-se ao contrario porque o pop faz ao contrario
        multRotationY(time/MOON_YEAR * 360);
        multTranslation([MOON_ORBIT, 0,0]);
        Moon();
    popMatrix();
}

function Mercury() {
    multScale([MERCURY_DIAMETER, MERCURY_DIAMETER, MERCURY_DIAMETER]);
    multRotationY(time/MERCURY_DAY * 360);
    //venus
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    sphereDrawWireFrame(gl, program);
}

function Venus() {
    multScale([VENUS_DIAMETER, VENUS_DIAMETER, VENUS_DIAMETER]);
    multRotationY(time/VENUS_DAY * 360);
    //venus
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    sphereDrawWireFrame(gl, program);
}


function Sun() {
    //indiferente a ordem neste caso
    multScale([SUN_DIAMETER, SUN_DIAMETER, SUN_DIAMETER]);
    multRotationY((time/SUN_DAY)*360);
    //SUN
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    sphereDrawWireFrame(gl, program);
}

function SolarSystem() {
    pushMatrix();
        Sun();
    popMatrix();
    pushMatrix();
        multRotationY(time/MERCURY_YEAR * 360);
        multTranslation([MERCURY_ORBIT, 0, 1]);
        Mercury();
    popMatrix();
    pushMatrix();
        multRotationY(time/VENUS_YEAR * 360);
        multTranslation([VENUS_ORBIT, 0, 1]);
        Venus();
    popMatrix();
    pushMatrix();
        multRotationY(time/EARTH_YEAR * 360);
        multTranslation([EARTH_ORBIT, 0, 1]);
        EarthAndMoon();
    popMatrix();
}

function render() 
{
    requestAnimationFrame(render);
    /*if(animation) {
        time += speed;
    }*/
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    modelView = lookAt([0,VP_DISTANCE,VP_DISTANCE], [0,0,0], [0,1,0]);

    //EarthAndMoon();
   // Sun();
   //Earth();
     //Moon();
    SolarSystem();

    time += 0.05;
}