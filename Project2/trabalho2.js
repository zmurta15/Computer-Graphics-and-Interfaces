const WIREFRAME = 0, SOLID = 1;
const CUBE = 0, SPHERE = 1;
const TORUS = 2;
const CYLINDER = 3;
const PARAB = 4;

var canvas;
var gl;
var program;
var mode = WIREFRAME;


var aspect;

var mProjectionLoc, mModelViewLoc;

var speed = 1;

var matrixStack = [];
var modelView;

var colorLoc, color;
var chooseLoc, choose = 0;
var turn = 0;
var run= 0;
var bracoRotate1 = 0;
var bracoRotate2 = 0;
var choice = 0;
var aux = 0;
var speeding = 0;

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


var drawFuncs = [
    [cubeDrawWireFrame, sphereDrawWireFrame, torusDrawWireFrame, cylinderDrawWireFrame, parabDrawWireFrame],
    [cubeDrawFilled, sphereDrawFilled, torusDrawFilled, cylinderDrawFilled, parabDrawFilled]
];

function drawPrimitive(obj, mode, program) {
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(modelView));
    gl.uniform4fv(colorLoc, color);
    gl.uniform1f(chooseLoc, choose);
    drawFuncs[mode][obj](gl, program);
}

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
    colorLoc = gl.getUniformLocation(program, "color");
    chooseLoc = gl.getUniformLocation(program, "choose");

    cubeInit(gl);
    sphereInit(gl);
    torusInit(gl);
    cylinderInit(gl);
    parabInit(gl);

    document.onkeydown = function(event) {
        switch(event.key) {
            case 'c':
                mode = WIREFRAME; 
                break;
            case 'x':
                mode = SOLID;
                break;
            case ' ':
                if (choose == 0) {
                    choose = 1;
                } else {
                    choose = 0;
                }
                break;
            case 'a':
                if (turn <= 45) {
                    turn+= 5;
                    run = 0;
                } 
                break;
            case 'd':
                if (turn >= -45) {
                    turn -=5;
                    run = 0;
                }
                break;
            case 'w':
                if(speed<4) {
                    speed += 0.05;
                }
                run -=5*speed;
                turn = 0;
                aux += ((10*Math.PI)/360)*speed;
                break;
            case 's':
                if (speeding == 1.0) {
                    speed -= 0.05
                } else {
                    if  (speed <4) {
                        speed += 0.05;
                    }
                    run += 5*speed;
                    turn = 0;
                    aux -= ((10*Math.PI)/360)*speed;
                }
                break;
            case 'i':
                if (bracoRotate1 < 130) {
                    bracoRotate1 += 2;
                }
                break;
            case 'k':
                if (bracoRotate1 > -20) {
                    bracoRotate1 -= 2;    
                }
                break;
            case 'j':
                bracoRotate2 += 2;
                break;
            case 'l':
                bracoRotate2 -= 2;
                break;
            case '0':
                choice = 0;
                break;
            case '1':
                choice = 1;
                break;
            case'2':
                choice = 2;
                break;
            case '3':
                choice = 3;
                break;
        }
    }

    document.onkeyup = function (event) {
        switch(event.key) {
            case 'w':
                speeding = 1.0;
                break;
            case 's':
                if (speeding != 1.0) {
                    speeding = 2.0;
                }
                break;
        }
    }

    render();
}


const VP_DISTANCE = 10;
const CUBE_SIDE = 3;
const CARROCARIA_LENGTH = 6;
const CARROCARIA_HEIGTH  = 3;
const CARROCARIA_WIDTH = 3.5;
const NUMBER_CUBES = 24;


function cubeFloor() {
    multScale([CUBE_SIDE, CUBE_SIDE, CUBE_SIDE]);
    //cubes of the floor
    color = [0.33, 0.42, 0.18, 1.0];
    drawPrimitive(CUBE, mode, program);
}

function floor(x,y) {
    pushMatrix();
        multTranslation([x*CUBE_SIDE, 0, y*CUBE_SIDE]);
        cubeFloor();
    popMatrix();
}

function fullFloor() {
    for(var xis = -NUMBER_CUBES/2; xis <=NUMBER_CUBES/2; xis++) {
        for(var yis = -NUMBER_CUBES/2; yis <= NUMBER_CUBES/2; yis++) {
            floor(xis, yis);
        }
    }
}

function carrocaria() {
    multScale([CARROCARIA_LENGTH, CARROCARIA_HEIGTH, CARROCARIA_WIDTH]);
    color = [1.0, 1.0, 1.0, 1.0];
    drawPrimitive(CUBE, mode, program);
}

function carrocariaTotal() {
    pushMatrix();  
        carrocaria();
    popMatrix();
    pushMatrix(); 
        multScale([1/7, 3/5, 1])
        multTranslation([CARROCARIA_LENGTH*4, -1.0, 0]); 
        carrocaria();
    popMatrix(); 
}

function roda() {
    color = [0.5, 0.5, 0.5, 1.0];
    drawPrimitive(TORUS, mode, program);
}


function cilindro() {
    multScale([0.4, 1, 0.4]);
    color = [0.3 , 0.3, 0.3, 1.0];
    drawPrimitive(CYLINDER, mode, program);
}

function rotula() {
    multScale([0.6, 0.6, 0.6]);
    color = [0.3 , 0.3, 0.3, 1.0];
    drawPrimitive(SPHERE, mode, program);
}

function braco() {
    pushMatrix();
        rotula();
    popMatrix();
    pushMatrix();
        multTranslation([1.0, 0, 0]);
        multRotationZ(90);
        multScale([1, 1.7, 1]);
        cilindro();
    popMatrix();
}

function rodasFrente() {
    multRotationY(turn);
    multRotationX(90);
    roda();
        pushMatrix();
            multScale([0.5,0.5,0.6]);
            multRotationX(90);
            cilindro();
        popMatrix();
}

function rodasTras() {
    multRotationX(90);
    roda();
        pushMatrix();
            multScale([0.5,0.5,0.6]);
            multRotationX(90);
            cilindro();
        popMatrix();
}

function paraboloid() {
    multScale([2,2,2]);
    multRotationX(-90);
    color = [0.3 , 0.3, 0.3, 1.0];
    drawPrimitive(PARAB, mode, program);
}

function system() {
    //chao
    pushMatrix();  
        fullFloor();
    popMatrix();
    //carrocaria
    multTranslation([aux,0.0,0.0]);
    pushMatrix(); 
        multTranslation([0, CARROCARIA_WIDTH, 0]); 
        carrocariaTotal();
    popMatrix();
    //rodas da frente
    pushMatrix();
        multTranslation([2.2,2.2,CARROCARIA_WIDTH/2]);
        multRotationZ(run);
        rodasFrente();    
    popMatrix();
    pushMatrix();
        multTranslation([2.2,2.2,-CARROCARIA_WIDTH/2]);
        multRotationZ(run); 
        rodasFrente();
    popMatrix();
    //rodas de tras
    pushMatrix();
        multTranslation([-2.2,2.2,CARROCARIA_WIDTH/2]);
        multRotationZ(run);
        rodasTras();
    popMatrix();
    pushMatrix();
        multTranslation([-2.2,2.2,-CARROCARIA_WIDTH/2]); 
        multRotationZ(run);
        rodasTras();
    popMatrix();
    //ANTENA - BRACO
    pushMatrix();
        pushMatrix();
            pushMatrix();
                multTranslation([-1, 5.35, 0]);
                multScale([0.7, 0.7, 0.7]);
                cilindro();
            popMatrix();
            pushMatrix();
                multTranslation([-1, 5.65, 0]);
                multScale([0.7, 0.7, 0.7]);
                multRotationZ(bracoRotate1);
                multRotationY(bracoRotate2);
                braco();
                pushMatrix();
                    multTranslation([1.7,0.2,0.0]);
                    multScale([0.3,0.3,0.3]);
                    paraboloid();
                    pushMatrix();
                        multRotationX(90);
                        multScale([1,1.5,1]);
                        cilindro();
                    popMatrix();
                popMatrix();
            popMatrix();
        popMatrix(); 
    popMatrix();
}


function render() 
{
    requestAnimationFrame(render);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var projection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-3*VP_DISTANCE,3*VP_DISTANCE);
    
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(projection));

    if (choice == 0) {
        modelView = lookAt([5,5,5], [0,0,0], [0,1,0]);
    } else if (choice == 1) {
        modelView = lookAt([0,5,0.01], [0,0,0], [0,1,0]);   
    } else if (choice == 2) {
        modelView = mat4();
    } else if (choice == 3) {
        modelView = modelView = lookAt([5,0,0], [0,0,0], [0,1,0]);
    }

    if (speeding == 1.0) {
        speed -= 0.05;
        run -=5*speed;
        turn = 0;
        aux += ((10*Math.PI)/360)*speed;
        if(speed <=1) {
            speeding = 0.0;
        }
    }

    if (speeding == 2.0) {
        speed-= 0.05;
        run += 5*speed;
        turn = 0;
        aux -= ((10*Math.PI)/360)*speed;
        if(speed <=1) {
            speeding = 0.0;
        }
    }
    
    system();
}
