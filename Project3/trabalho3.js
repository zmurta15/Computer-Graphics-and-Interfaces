const WIREFRAME = 0, SOLID = 1;
const CUBE = 0, SPHERE = 1;
const TORUS = 2;
const CYLINDER = 3;
const PARAB = 4;


var gl, program;
var mode = WIREFRAME;
var obj = CUBE;
var modeZ = false;
var modeBF = false;


var aspect;
var canvas;

var thetaValue = 0;
var gammaValue = 0;
var dValue = 5;
var xLight = 0.0;
var yLight = 0.0;
var zLight = 1.3;
var lightType = 1;

var mModelLoc;
var mView = lookAt(vec3(0, 0, 1), vec3(0, 0, 0), vec3(0, 1, 0));
var mProjection;
var mLightCoords = vec4(0.0, 0.0, 1.3, lightType); 
var mNormals = inverse(transpose(mView));
var mViewNormals = inverse(transpose(mView));
var mShininess = 5;
var mMaterialDif = vec3(22.0/255,192.0/255,158.0/255);
var mMaterialSpe = vec3(228/255, 155/255, 160/255);
var mLightAmb = vec3(30/255,200/255,135/255);
var mLightDif = vec3(160/255,217/255,182/255);
var mLightSpe = vec3(212/255,175/255, 175/255);
var mPerspetiva = 0;
var mLightOnOff = 1;

var projectionType = 1; 
var zoom = 1;
var clicking = false;
var x1;
var y1;
var freeX = 0;
var freeY = 0;

var drawFuncs = [
    [cubeDrawWireFrame, sphereDrawWireFrame, torusDrawWireFrame, cylinderDrawWireFrame, parabDrawWireFrame],
    [cubeDrawFilled, sphereDrawFilled, torusDrawFilled, cylinderDrawFilled, parabDrawFilled]
];

function hexToRgb (hex) {
    if (hex.charAt(0) === '#') {
        hex = hex.substr(1);
    }
    var values = hex.split(''),r,g,b;
    r = parseInt(values[0].toString() + values[1].toString(), 16);
    g = parseInt(values[2].toString() + values[3].toString(), 16);
    b = parseInt(values[4].toString() + values[5].toString(), 16);
    return [r/255, g/255, b/255];
}

function drawPrimitive(obj, mode, program) {
    gl.uniformMatrix4fv(mModelLoc, false, flatten(mat4()));
    drawFuncs[mode][obj](gl, program);
}

function fit_canvas_to_window()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight/1.2;

    aspect = canvas.width / canvas.height;
    gl.viewport(0, 0,canvas.width, canvas.height);

}

window.onresize = function() {
    fit_canvas_to_window();
}


function calculeAxo(a, b) {
    var aRadians = a * (Math.PI/180);
    var bRadians = b * (Math.PI/180);
    var th = Math.atan(Math.sqrt(Math.tan(aRadians)/Math.tan(bRadians))) - Math.PI/2;
    var ga = Math.asin(Math.sqrt(Math.tan(aRadians)*Math.tan(bRadians)));
    var thDegrees = (th * 180)/Math.PI;
    var gaDegrees = (ga * 180)/Math.PI;
    mView = lookAt(vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, 1, 0));
    mProjection = ortho(-1*aspect * zoom, 1*aspect*zoom, -1*zoom, 1*zoom,10*zoom,-10*zoom);
    mProjection = mult(mProjection, rotateX(gaDegrees));
    mProjection = mult (mProjection, rotateY(thDegrees));
}

function calculeFreeAxo() {
    mView = lookAt(vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, 1, 0));
    mProjection = ortho(-1*aspect*zoom, 1*aspect*zoom, -1*zoom, 1*zoom, 10*zoom, -10*zoom);
    mProjection = mult(mProjection, rotateX(gammaValue));
    mProjection = mult (mProjection, rotateY(thetaValue));
}

function calculatePerspective () {
    if(zoom >= 4) {
        zoom = 4;
    }
    mView = lookAt(vec3(0, 0, 1), vec3(0, 0, 0), vec3(0, 1, 0)); //estava (0,0,0) (-1, 0, 0)
    var fovy = 2* Math.atan(canvas.height / (2*dValue));
    mProjection = mult(perspective(fovy*10*zoom, aspect,1*zoom,100*zoom), translate(0, 0, -dValue));
    mView = mult(mView, rotateY(freeX));
    mView = mult(mView, rotateX(freeY));
}

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    fit_canvas_to_window();
    
    // Configure WebGL
    gl.clearColor(0.13, 0.13, 0.13, 1.0);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE)
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    mModelLoc = gl.getUniformLocation(program, "mModel");
    mviewLoc = gl.getUniformLocation(program, "mView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    mLightCoordsLoc = gl.getUniformLocation(program, "mLightCoords");
    mNormalsLoc = gl.getUniformLocation(program, "mNormals");
    mViewNormalsLoc = gl.getUniformLocation(program, "mViewNormals");
    mShininessLoc = gl.getUniformLocation(program, "mShininess");
    mMaterialAmbLoc = gl.getUniformLocation(program, "mMaterialAmb");
    mMaterialDifLoc = gl.getUniformLocation(program, "mMaterialDif");
    mMaterialSpeLoc = gl.getUniformLocation(program, "mMaterialSpe");
    mLightAmbLoc = gl.getUniformLocation(program, "mLightAmb");
    mLightDifLoc = gl.getUniformLocation(program, "mLightDif");
    mLightSpeLoc = gl.getUniformLocation(program, "mLightSpe");
    mPerspetivaLoc = gl.getUniformLocation (program, "mPerspetiva");
    mLightOnOffLoc = gl.getUniformLocation (program, "mLightOnOff");
    mLightOnOffLoc1 = gl.getUniformLocation (program, "mLightOnOff1");

    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    torusInit(gl);
    parabInit(gl);

    document.getElementById("new_cube").onclick=function() {
        obj = CUBE;
    };

    document.getElementById("new_sphere").onclick=function() {
        obj = SPHERE;
    };

    document.getElementById("new_cylinder").onclick=function() {
        obj = CYLINDER;
    };

    document.getElementById("new_torus").onclick=function() {
        obj = TORUS;
    };

    document.getElementById("new_parab").onclick=function() {
        obj = PARAB;
    };

    document.onkeydown = function(event) {
        switch(event.key) {
            case 'w':
                mode = WIREFRAME;
                break;
            case 'f':
                mode = SOLID;
                break;
            case 'z':
                if(modeZ) {
                    modeZ = false;
                    gl.disable(gl.DEPTH_TEST);
                    document.getElementById("zInformation").innerHTML = "Z-Buffer: OFF";
                }
                else {
                    modeZ = true;
                    gl.enable(gl.DEPTH_TEST);
                    document.getElementById("zInformation").innerHTML = "Z-Buffer: ON";
                }
                break;
            case 'b':
                if(modeBF) {
                    modeBF = false;
                    gl.disable(gl.CULL_FACE);
                    document.getElementById("cullingInformation").innerHTML = "Backface Culling: OFF";
                }
                else {
                    modeBF = true;
                    gl.enable(gl.CULL_FACE);
                    gl.cullFace(gl.BACK); 
                    document.getElementById("cullingInformation").innerHTML = "Backface Culling: ON";
                }
                break;
            case 'l':
                if(mLightOnOff == 0) {
                    mLightOnOff = 1;
                    document.getElementById("lightSettings").style.display = "block";
                }
                else {
                    mLightOnOff = 0;
                    document.getElementById("lightSettings").style.display = "none";
                }
        }
    }

    var event1 = document.getElementById("projection");
    event1.addEventListener("change", function() {    
        switch (event1.selectedIndex) {
            case 0:
                projectionType = 0; //ortogonal
                document.getElementById("orthoTitle").style.display = "block";
                document.getElementById("axoTitle").style.display = "none";
                document.getElementById("freeAxoSliders").style.display = "none";
                document.getElementById("dSlider").style.display = "none";
                document.getElementById("orthoType").selectedIndex = 0;
                mPerspetiva = 0;
                mView = lookAt(vec3(0, 0, 1), vec3(0, 0, 0), vec3(0, 1, 0));
                break;
            case 1:
                projectionType = 1; //axonometric
                calculeAxo(30, 30);
                document.getElementById("axoTitle").style.display = "block";
                document.getElementById("orthoTitle").style.display = "none";
                document.getElementById("dSlider").style.display = "none";
                document.getElementById("axoType").selectedIndex = 0;
                mPerspetiva = 0;
                break;
            case 2:
                projectionType = 2; //perspective
                document.getElementById("dSlider").style.display = "block";
                document.getElementById("orthoTitle").style.display = "none";
                document.getElementById("axoTitle").style.display = "none";
                document.getElementById("freeAxoSliders").style.display = "none";
                calculatePerspective();
                mPerspetiva = 1;
                break;
        }
    });


    var event2 = document.getElementById("orthoType");
    event2.addEventListener("click", function() {
        switch(event2.selectedIndex) {
            case 0: //AP
                mView = lookAt(vec3(0, 0, 1), vec3(0, 0, 0), vec3(0, 1, 0));
                break;
            case 1: //P
                mView = lookAt(vec3(0, 1, 0), vec3(0, 0, 0), vec3(0, 0, -1)); 
                break;
            case 2: //R
                mView = lookAt(vec3(1, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)); 
                break;
        }
    });

    var event3 = document.getElementById("axoType");
    event3.addEventListener("click", function() {
        switch(event3.selectedIndex) {
            case 0: //iso
                calculeAxo(30, 30);
                document.getElementById("freeAxoSliders").style.display = "none";
                break;
            case 1: //dimetry
                calculeAxo(42, 7);
                document.getElementById("freeAxoSliders").style.display = "none";
                break;
            case 2: //trimetry
                calculeAxo(54+16/60, 23+16/60);
                document.getElementById("freeAxoSliders").style.display = "none";
                break;
            case 3: //free
                calculeFreeAxo();
                document.getElementById("freeAxoSliders").style.display = "block";
                break;
        }
    });

    canvas.addEventListener('wheel', function(event4) {
        if(event4.deltaY < 0) {
            if(zoom > 0.3) {
                zoom -= 0.1;
            }
        }
        else if(event4.deltaY > 0) {
            if(zoom < 10)
                zoom += 0.1;
        }
        if(projectionType ==1 && event3.selectedIndex == 0) {
            calculeAxo(30, 30);
        }
        else if(projectionType ==1 && event3.selectedIndex == 1) {
            calculeAxo(42, 7);
        }
        else if(projectionType ==1 && event3.selectedIndex == 2) {
            calculeAxo(54+16/60, 23+16/60);
        }
        else if (projectionType == 1 && event3.selectedIndex == 3) {
            calculeFreeAxo();
        }
        else if(projectionType == 2) {
            calculatePerspective();
        }
    });

    var theta = document.getElementById("theta");
    theta.oninput = function() {
        thetaValue = theta.value;
        calculeFreeAxo();
    }

    var gamma = document.getElementById("gamma");
    gamma.oninput = function() {
        gammaValue = gamma.value;
        calculeFreeAxo();
    }

    var d = document.getElementById("distance");
    d.oninput = function() {
        dValue = d.value;
        calculatePerspective();
    }

    var event5 = document.getElementById("x");
    event5.oninput = function() {
        xLight = event5.value;
        mLightCoords = vec4 (xLight , yLight, zLight, lightType);
    }

    var event6 = document.getElementById("y");
    event6.oninput = function() {
        yLight = event6.value;
        mLightCoords = vec4 (xLight , yLight, zLight, lightType);
    }

    var event7 = document.getElementById("z");
    event7.oninput = function() {
        zLight = event7.value;
        mLightCoords = vec4 (xLight , yLight, zLight, lightType);
    }

    var event8 = document.getElementById("lightType");
    event8.addEventListener("click", function() {
        switch(event8.selectedIndex) {
            case 0: 
                lightType = 0;
                mLightCoords = vec4 (xLight , yLight, zLight, lightType);
                break;
            case 1: 
                lightType = 1;
                mLightCoords = vec4 (xLight , yLight, zLight, lightType);
                break;
        }
    });

    var event9 = document.getElementById("shininess");
    event9.oninput = function() {
        mShininess = event9.value;
    }

    var event11 = document.getElementById("colorPicker2");
    event11.oninput = function() {
        mMaterialDif = vec3(hexToRgb(event11.value));
    }

    var event12 = document.getElementById("colorPicker3");
    event12.oninput = function() {
        mMaterialSpe = vec3(hexToRgb(event12.value));
    }


    var event13 = document.getElementById("colorPicker4");
    event13.oninput = function() {
        mLightAmb = vec3(hexToRgb(event13.value));
    }
    var event14 = document.getElementById("colorPicker5");
    event14.oninput = function() {
        mLightDif = vec3(hexToRgb(event14.value));
    }
    var event15 = document.getElementById("colorPicker6");
    event15.oninput = function() {
        mLightSpe = vec3(hexToRgb(event12.value));
    }


    canvas.addEventListener('mousedown', function(event16) {
        if (projectionType == 2) {
            clicking = true;
            x1 = event16.x;
            y1 = event16.y;
        }

    });

    canvas.addEventListener('mousemove', function(event17) {
        if(clicking == true) {
            var x2 = event17.x;
            var y2 = event17.y;

            if (x2-x1 > 3) {
                freeX += 4;
            } else if (x2-x1 < -10) {
                freeX -= 4;
            }

            if (y2-y1 > 3) {
                freeY += 4;
            } else if (y2-y1 < -10) {
                freeY -= 4;
            }

            calculatePerspective();
            x1 = x2;
            y1 = y2;
        }
    });

    canvas.addEventListener('mouseup', function(event18) {
        clicking =false;
    });

    calculeAxo(42, 7);
    document.getElementById("freeAxoSliders").style.display = "none";
    document.getElementById("axoTitle").style.display = "block";
    document.getElementById("orthoTitle").style.display = "none";
    document.getElementById("dSlider").style.display = "none";
    document.getElementById("projection").selectedIndex = 1;
    document.getElementById("axoType").selectedIndex = 1;
    document.getElementById("lightType").selectedIndex = 1;

    render();
}



function render() {
    if(projectionType == 0) {
        mProjection = ortho(-1*aspect*zoom,1*aspect*zoom,-1*zoom,1*zoom,-10*zoom,10*zoom); 
    }

    gl.uniformMatrix4fv(mviewLoc, false, flatten(mView));
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));
    gl.uniform4fv(mLightCoordsLoc, mLightCoords);
    gl.uniformMatrix4fv(mNormalsLoc,false,  flatten(mNormals));
    gl.uniformMatrix4fv(mViewNormalsLoc, false, flatten (mViewNormals));
    gl.uniform1f(mShininessLoc, mShininess);
    gl.uniform3fv(mMaterialAmbLoc, mMaterialDif); 
    gl.uniform3fv(mMaterialDifLoc, mMaterialDif);
    gl.uniform3fv(mMaterialSpeLoc, mMaterialSpe);
    gl.uniform3fv(mLightAmbLoc, mLightAmb);
    gl.uniform3fv(mLightDifLoc, mLightDif);
    gl.uniform3fv(mLightSpeLoc, mLightSpe);
    gl.uniform1f(mPerspetivaLoc, mPerspetiva);
    gl.uniform1f(mLightOnOffLoc, mLightOnOff);
    gl.uniform1f(mLightOnOffLoc1, mLightOnOff);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   
    drawPrimitive(obj, mode, program);
    window.requestAnimationFrame(render);
}
