//create Cube
function createCube(sideLength, center) {
  //constants for calculations
  const halfSideLength = sideLength / 2;
  const centerX = center[0];
  const centerY = center[1];
  const centerZ = center[2];

  // Calculate the coordinates of the cube's vertices based on the center position
  //prettier-ignore
  const vertices = [
   
    // Front 
    centerX - halfSideLength, centerY - halfSideLength, centerZ - halfSideLength, 0.0, 0.0, 1.0,
    centerX - halfSideLength, centerY + halfSideLength,  centerZ - halfSideLength, 0.0, 0.0, 1.0,
    centerX + halfSideLength, centerY + halfSideLength, centerZ - halfSideLength, 0.0, 0.0, 1.0,
    centerX + halfSideLength, centerY - halfSideLength, centerZ - halfSideLength, 0.0, 0.0, 1.0,
    // Back 
    centerX - halfSideLength, centerY - halfSideLength, centerZ + halfSideLength, 1.0, 0.0, 0.0,
    centerX + halfSideLength, centerY - halfSideLength, centerZ + halfSideLength, 1.0, 0.0, 0.0,
    centerX + halfSideLength, centerY + halfSideLength, centerZ + halfSideLength, 1.0, 0.0, 0.0,
    centerX - halfSideLength, centerY + halfSideLength, centerZ + halfSideLength, 1.0, 0.0, 0.0,
    // Top 
    centerX - halfSideLength, centerY + halfSideLength, centerZ - halfSideLength, 1.0, 1.0, 0.0,
    centerX - halfSideLength, centerY + halfSideLength, centerZ + halfSideLength, 1.0, 1.0, 0.0,
    centerX + halfSideLength, centerY + halfSideLength, centerZ + halfSideLength, 1.0, 1.0, 0.0,
    centerX + halfSideLength, centerY + halfSideLength, centerZ - halfSideLength, 1.0, 1.0, 0.0,
    // Bottom 
    centerX - halfSideLength, centerY - halfSideLength, centerZ - halfSideLength, 0.0, 1.0, 0.0,
    centerX + halfSideLength, centerY - halfSideLength, centerZ - halfSideLength,  0.0, 1.0, 0.0,
    centerX + halfSideLength, centerY - halfSideLength, centerZ + halfSideLength,  0.0, 1.0, 0.0,
    centerX - halfSideLength, centerY - halfSideLength, centerZ + halfSideLength,  0.0, 1.0, 0.0,
    // Right
    centerX - halfSideLength, centerY - halfSideLength, centerZ - halfSideLength, 1.0, 0.5, 0.0,
    centerX - halfSideLength, centerY - halfSideLength, centerZ + halfSideLength, 1.0, 0.5, 0.0,
    centerX - halfSideLength, centerY + halfSideLength, centerZ + halfSideLength, 1.0, 0.5, 0.0,
    centerX - halfSideLength, centerY + halfSideLength, centerZ - halfSideLength, 1.0, 0.5, 0.0,
    // Left 
    centerX + halfSideLength, centerY - halfSideLength, centerZ - halfSideLength, 1.0, 0.0, 1.0,
    centerX + halfSideLength, centerY + halfSideLength,centerZ - halfSideLength, 1.0, 0.0, 1.0,
    centerX + halfSideLength, centerY + halfSideLength, centerZ + halfSideLength, 1.0, 0.0, 1.0,
    centerX + halfSideLength, centerY - halfSideLength,centerZ + halfSideLength, 1.0, 0.0, 1.0,
  ];

  // Define the indices for the cube
  //prettier-ignore
  const indices = [
    //Face 1
    0, 1, 2, 
    0, 2, 3,
    //Face 2 
    4, 5, 6, 
    4, 6, 7, 
    //Face 3
    8, 9, 10, 
    8, 10, 11, 
    //Face 4
    12, 13, 14,
    12, 14, 15, 
    //Face 5
    16, 17, 18, 
    16, 18, 19,
    //Face 6 
    20, 21, 22, 
    20, 22, 23,
  ];

  return { vertices, indices };
}

//create Cylinder
function createCylinder(radius, center, height, segments) {
  //constants for calculations
  const centerX = center[0];
  const centerY = center[1];
  const centerZ = center[2];
  const centerTop = [centerX, centerY + height / 2, centerZ];
  const centerBot = [centerX, centerY - height / 2, centerY];

  var vertices = [];
  var indices = [];

  // Create vertices for the side of the cylinder
  for (let i = 0; i < segments; i++) {
    //Get angle for next point based on number of segments
    var theta = 2 * Math.PI * (i / segments);

    //X and Y position at that angle
    var x = radius * Math.cos(theta) + centerX;
    var z = radius * Math.sin(theta) + centerZ;

    // Top vertex
    vertices.push(x, centerY + height / 2, z, 1.0, 0.0, 0.0);
    // Bottom vertex
    vertices.push(x, centerY - height / 2, z, 0.0, 1.0, 0.0);
  }

  // Add cylinder top center vertex
  vertices.push(centerTop[0], centerTop[1], centerTop[2], 1.0, 0.0, 0.0);
  // Add cylinder bottom center vertex
  vertices.push(centerBot[0], centerBot[1], centerBot[2], 0.0, 1.0, 0.0);

  // Create indices for the cylinder's triangles
  for (let i = 0; i < segments; i++) {
    var index = i * 2;
    // Side triangle indices. Have to include % segments * 2 to make sure the indices wrap around when they exceed their max limit.
    indices.push(
      index,
      (index + 2) % (segments * 2),
      (index + 1) % (segments * 2),
    );
    indices.push(
      (index + 2) % (segments * 2),
      (index + 3) % (segments * 2),
      (index + 1) % (segments * 2),
    );

    // Top triangle indices
    indices.push(segments * 2, (index + 2) % (segments * 2), index);

    // Bottom triangle indices
    indices.push(
      segments * 2 + 1,
      (index + 1) % (segments * 2),
      (index + 3) % (segments * 2),
    );
  }

  return { vertices, indices };
}

//Create Sphere
function createSphere(radius, center, stacks, sectors) {
  const centerX = center[0];
  const centerY = center[1];
  const centerZ = center[2];

  var vertices = [];
  var indices = [];

  for (let i = 0; i <= stacks; i++) {
    var theta = (2 * Math.PI * i) / stacks;

    for (let j = 0; j <= sectors; j++) {
      var phi = (2 * Math.PI * j) / sectors;

      //Calculate x y and z for current vertex
      var x = centerX + radius * Math.cos(phi) * Math.sin(theta);
      var y = centerY + radius * Math.cos(theta);
      var z = centerZ + radius * Math.sin(phi) * Math.sin(theta);

      //Stripe with complemetary colors! (purple and yellow)
      if (j % 2 == 0) {
        vertices.push(x, y, z, 1.0, 0.0, 1.0);
      } else {
        vertices.push(x, y, z, 1.0, 1.0, 0.0);
      }
    }
  }

  //Indices
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < sectors; j++) {
      var first = i * (sectors + 1) + j;
      var second = first + sectors + 1;

      //same pattern as cylinder/cube
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return { vertices, indices };
}
