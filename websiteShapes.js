document.addEventListener("DOMContentLoaded", function () {
  // Get context
  const canvas = document.getElementById("drawingCanvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  // Clear the canvas
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Backface culling
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);
  gl.enable(gl.DEPTH_TEST);

  // Vertex and fragment shaders
  var vertexShaderSource = `
        precision mediump float;

        attribute vec3 a_position;
        attribute vec3 a_color;
        varying vec3 fragColor;
        uniform mat4 worldMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;

        void main() {
            fragColor = a_color;
            gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(a_position, 1.0);
        }
    `;

  var fragmentShaderSource = `
        precision mediump float;

        varying vec3 fragColor;

        void main() {
            gl_FragColor = vec4(fragColor, 1.0); 
        }
    `;

  // Compile shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  var program = makeProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  //Make Cube
  var cube = createCube(1, [2, 0, 0]); // cube takes a side length and a center point
  cubeVertices = cube.vertices;
  cubeIndices = cube.indices;
  var cubeBufferObject = gl.createBuffer();
  var cubeIndexBufferObject = gl.createBuffer();

  //Make Cylinder
  var cylinder = createCylinder(0.5, [0, 0, 0], 1, 20); // cylinder takes a radius, center, height, and number of segments
  cylinderVertices = cylinder.vertices;
  cylinderIndices = cylinder.indices;
  var cylinderBufferObject = gl.createBuffer();
  var cylinderIndexBufferObject = gl.createBuffer();

  //Make Sphere
  var sphere = createSphere(0.5, [-2, 0, 0], 20, 20); //sphere takes a radius, center, number of longitude bands (sectors) and number of latitude bands (stacks)
  sphereVertices = sphere.vertices;
  sphereIndices = sphere.indices;
  var sphereBufferObject = gl.createBuffer();
  var sphereIndexBufferObject = gl.createBuffer();

  //Transform matrix locations
  var worldUniformLocation = gl.getUniformLocation(program, "worldMatrix");
  var viewUniformLocation = gl.getUniformLocation(program, "viewMatrix");
  var projectionUniformLocation = gl.getUniformLocation(
    program,
    "projectionMatrix"
  );

  //Declare empty matrices
  var worldMatrix = glMatrix.mat4.create();
  var viewMatrix = glMatrix.mat4.create();
  var projMatrix = glMatrix.mat4.create();

  //World Matrix Setup
  var translation = [0, 0, 0];
  glMatrix.mat4.fromTranslation(worldMatrix, translation); // starts as identity matrix with 0 translation

  // View Matrix Setup
  var upAngle = 0; // This angle will alter the up vector
  var eye = [0, 0, -4]; // Eye vector
  var center = [0, 0, 0]; // Center vector
  var up = [0, 1, 0]; // Up vector
  glMatrix.mat4.lookAt(viewMatrix, eye, center, up);

  // Projection Matrix Setup
  var fov = Math.PI / 4; // field of view in radians
  var aspectRatio = canvas.width / canvas.height; // aspect ratio
  var near = 0.2; // near bound of frustum
  var far = 500; // far bound of frustum
  glMatrix.mat4.perspective(projMatrix, fov, aspectRatio, near, far);

  // Set the matrices
  gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(projectionUniformLocation, gl.FALSE, projMatrix);

  // Track the states of input keys
  var keyStates = {
    Y: false,
    y: false,
    R: false,
    r: false,
    P: false,
    p: false,
  };

  //contains all keys that we use
  const eventKeys = ["Y", "y", "R", "r", "P", "p", "w", "a", "s", "d"];

  //Set the corresponding keystate to true when it is pressed
  function handleKeyPress(event) {
    if (eventKeys.includes(event.key)) {
      keyStates[event.key] = true;
    }
  }

  //Set the corresponding keystate to false when it is pressed
  function handleKeyRelease(event) {
    if (eventKeys.includes(event.key)) {
      //Have to manually set capital key states to false due to bug with capital letters and the release key event.
      keyStates["Y"] = false;
      keyStates["R"] = false;
      keyStates["P"] = false;

      keyStates[event.key] = false;
    }
  }

  const identityMatrix = glMatrix.mat4.create();
  //update scene function called every 20 milliseconds
  function updateScene() {
    // Get a new angle for rotation
    var timeAngle = (performance.now() / 3000) * Math.PI;

    // updates camera yaw, pitch, and roll based on keystates
    if (keyStates["Y"]) {
      center[0] += 0.1;
    }
    if (keyStates["y"]) {
      center[0] -= 0.1;
    }
    if (keyStates["R"]) {
      upAngle += 0.05;
    }
    if (keyStates["r"]) {
      upAngle -= 0.05;
    }
    if (keyStates["P"]) {
      center[1] += 0.1;
    }
    if (keyStates["p"]) {
      center[1] -= 0.1;
    }

    // updates world matrix translation based on keystates
    if (keyStates["w"]) {
      translation[2] = translation[2] += 0.03;
    }
    if (keyStates["a"]) {
      translation[0] = translation[0] += 0.03;
    }
    if (keyStates["s"]) {
      translation[2] = translation[2] -= 0.03;
    }
    if (keyStates["d"]) {
      translation[0] = translation[0] -= 0.03;
    }

    //Applies new transformation
    var translationMatrix = glMatrix.mat4.create();
    glMatrix.mat4.fromTranslation(translationMatrix, translation);
    var rotationMatrix = glMatrix.mat4.create();
    glMatrix.mat4.fromRotation(rotationMatrix, timeAngle, [1, 0, 0]);

    //Multiply rotate and translate matrices
    glMatrix.mat4.multiply(worldMatrix, translationMatrix, rotationMatrix);

    gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, worldMatrix);

    //Applies new camera rotations
    up[0] = Math.sin(upAngle);
    up[1] = Math.cos(upAngle);
    glMatrix.mat4.lookAt(viewMatrix, eye, center, up);
    gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, viewMatrix);

    //Clear
    gl.clearColor(1.0, 0.5, 0.5, 0.5);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Redraw with new matrices
    changeShape("cube");
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
    changeShape("cylinder");
    gl.drawElements(gl.TRIANGLES, cylinderIndices.length, gl.UNSIGNED_SHORT, 0);
    changeShape("sphere");
    gl.drawElements(gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_SHORT, 0);
  }

  //Event listeners
  document.addEventListener("keydown", handleKeyPress);
  document.addEventListener("keyup", handleKeyRelease);

  // Call updateScene every 20 milliseconds
  setInterval(updateScene, 20);

  // This function calls all the repeated code when a shape change needs to occur
  function changeShape(shape) {
    if (shape == "cube") {
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeBufferObject);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(cubeVertices),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBufferObject);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cubeIndices),
        gl.STATIC_DRAW
      );
    } else if (shape == "cylinder") {
      gl.bindBuffer(gl.ARRAY_BUFFER, cylinderBufferObject);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(cylinderVertices),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinderIndexBufferObject);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(cylinderIndices),
        gl.STATIC_DRAW
      );
    } else if (shape == "sphere") {
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereBufferObject);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(sphereVertices),
        gl.STATIC_DRAW
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBufferObject);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(sphereIndices),
        gl.STATIC_DRAW
      );
    }

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(
      positionAttributeLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    gl.vertexAttribPointer(
      colorAttributeLocation,
      3,
      gl.FLOAT,
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(colorAttributeLocation);
  }
});
