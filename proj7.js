'use strict';
let gl;
window.onload = function init() {
    let values = initialize();
    let textures = generateTextures();
    let bufferManager = new BufferManager(values.vBuffer, values.tBuffer);
    let scene = new Scene(bufferManager, values.uMVMatrix, mat4(), values.uPMatrix, mat4());
    let board = createBoard(textures);
    let player = createPlayer(textures.PACMAN);
    let scoreCallback = function (score) {
        console.log(score);
        let scoreHTMLELement = document.getElementById("score");
        scoreHTMLELement.innerText = "Score: " + score;
    };
    let game = new Game(textures, scene, board, player, values.aspect, scoreCallback);
    document.addEventListener("keydown", createKeyHandler(game));
};
function createKeyHandler(game) {
    return function (ev) {
        if (ev.keyCode === 37) {
            game.move(Direction.left);
        }
        else if (ev.keyCode === 38) {
            game.move(Direction.up);
        }
        else if (ev.keyCode === 39) {
            game.move(Direction.right);
        }
        else if (ev.keyCode === 27) {
            game.reset();
        }
        else if (ev.keyCode === 49) {
            game.setCamera(CameraView.perspective);
        }
        else if (ev.keyCode === 50) {
            game.setCamera(CameraView.topDown);
        }
        else if (ev.keyCode === 51) {
            game.setCamera(CameraView.everything);
        }
    };
}
function createObstacle(texture, x, y, scalex, scaley) {
    scalex = scalex || 1;
    scaley = scaley || scalex || 1;
    let square = makeSquare(texture);
    square.transform(mult(translate(x, y, 1), scalem(scalex, scaley, 2)));
    let lowerBound = new GameLocation(x, y);
    let upperBound = new GameLocation(x + scalex - 1, y + scaley - 1);
    return new Obstacle(square, new BoundingBox(lowerBound, upperBound));
}
function createWalls(texture, x, y) {
    let polygons = [];
    // bottom
    let wall1 = makeSquare(texture);
    wall1.transform(mult(translate(0, -1, 1), scalem(x + 1, 1, 2)));
    polygons.push(wall1);
    // top
    let wall2 = makeSquare(texture);
    wall2.transform(mult(translate(0, y + 1, 1), scalem(x + 1, 1, 2)));
    polygons.push(wall2);
    // left top
    let wall3 = makeSquare(texture);
    wall3.transform(mult(translate(-1, y / 2 + 2, 1), scalem(1, y / 2, 2)));
    polygons.push(wall3);
    // left bottom
    let wall4 = makeSquare(texture);
    wall4.transform(mult(translate(-1, -1, 1), scalem(1, y / 2 + 2, 2)));
    polygons.push(wall4);
    // right top
    let wall5 = makeSquare(texture);
    wall5.transform(mult(translate(x + 1, y / 2 + 2, 1), scalem(1, y / 2, 2)));
    polygons.push(wall5);
    // right bottom
    let wall6 = makeSquare(texture);
    wall6.transform(mult(translate(x + 1, -1, 1), scalem(1, y / 2 + 2, 2)));
    polygons.push(wall6);
    return polygons;
}
function createBoard(textures) {
    let upperBound = new GameLocation(25, 28);
    let polygons = [];
    let floor = makeSquare(textures.BLACK);
    floor.transform(scalem(upperBound.x + 1, upperBound.y + 1, 1));
    polygons.push(floor);
    let teleporter1Polygon = makeSquare(textures.BLACK);
    teleporter1Polygon.transform(mult(translate(upperBound.x + 1, upperBound.y / 2 + 1, 1), scalem(1, 1, 2)));
    polygons.push(teleporter1Polygon);
    let teleporter2Polygon = makeSquare(textures.BLACK);
    teleporter2Polygon.transform(mult(translate(-1, upperBound.y / 2 + 1, 1), scalem(1, 1, 2)));
    polygons.push(teleporter2Polygon);
    polygons = polygons.concat(createWalls(textures.WOOD, upperBound.x, upperBound.y));
    let obstacleLocations = [
        [1, 25, 4, 3],
        [6, 25, 5, 3],
        [1, 22, 4, 2],
        [6, 16, 2, 8],
        [8, 19, 3, 2],
        [9, 22, 8, 2],
        [12, 19, 2, 3],
        [12, 25, 2, 4],
        [15, 25, 5, 3],
        [21, 25, 4, 3],
        [21, 22, 4, 2],
        [18, 16, 2, 8],
        [15, 19, 3, 2],
        [9, 13, 8, 5],
        [0, 16, 5, 5],
        [21, 16, 5, 5],
        [0, 10, 5, 5],
        [21, 10, 5, 5],
        [9, 10, 8, 2],
        [12, 7, 2, 3],
        [9, 4, 8, 2],
        [12, 1, 2, 3],
        [6, 10, 2, 5],
        [1, 7, 4, 2],
        [3, 4, 2, 3],
        [0, 4, 2, 2],
        [1, 1, 10, 2],
        [6, 7, 5, 2],
        [6, 3, 2, 3],
        [18, 10, 2, 5],
        [21, 7, 4, 2],
        [21, 4, 2, 3],
        [24, 4, 2, 2],
        [15, 1, 10, 2],
        [15, 7, 5, 2],
        [18, 3, 2, 3]
    ];
    let obstacles = obstacleLocations.map(o => createObstacle(textures.BRICK, o[0], o[1], o[2], o[3]));
    let teleporter1 = new Teleporter(teleporter1Polygon, new GameLocation(26, 15), new GameLocation(0, 15));
    let teleporter2 = new Teleporter(teleporter2Polygon, new GameLocation(-1, 15), new GameLocation(25, 15));
    let teleporters = [teleporter1, teleporter2];
    return new Board(polygons, obstacles, teleporters, new BoundingBox(new GameLocation(0, 0), upperBound));
}
function createPlayer(texture) {
    let sphere = makeSphere(texture);
    sphere.transform(mult(scalem(0.5, 0.5, 0.5), translate(1, 1, 3)));
    let startLocation = new GameLocation(0, 0);
    return new Player(sphere, startLocation, Direction.up);
}
class BoundingBox {
    constructor(lowerBound, upperBound) {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }
    containsLocation(loc) {
        return (loc.x >= this.lowerBound.x && loc.x <= this.upperBound.x)
            && (loc.y >= this.lowerBound.y && loc.y <= this.upperBound.y);
    }
}
class GameLocation {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(location) {
        return this.x === location.x && this.y === location.y;
    }
}
class GameElement {
    constructor(polygon, location) {
        this.polygon = polygon;
        this.location = location;
    }
}
class Teleporter extends GameElement {
    constructor(polygon, location, endLocation) {
        super(polygon, location);
        this.polygon = polygon;
        this.endLocation = endLocation;
    }
}
class Obstacle extends GameElement {
    constructor(polygon, boundingBox) {
        super(polygon, boundingBox.lowerBound);
        this.boundingBox = boundingBox;
    }
}
class Player extends GameElement {
    constructor(polygon, startLocation, facing) {
        super(polygon, new GameLocation(startLocation.x, startLocation.y));
        this.startLocation = startLocation;
        this.facing = facing;
        this.startDirection = facing;
    }
    reset() {
        this.setLocation(this.startLocation);
        this.facing = this.startDirection;
    }
    setLocation(next) {
        let curr = this.location;
        this.polygon.transform(this.createTranslation(curr, next));
        this.location = next;
    }
    createTranslation(curr, next) {
        let xDiff = next.x - curr.x;
        let yDiff = next.y - curr.y;
        let playerOffset = [2, 2];
        return translate(xDiff * playerOffset[0], yDiff * playerOffset[1], 0);
    }
}
var CameraView;
(function (CameraView) {
    CameraView[CameraView["topDown"] = 0] = "topDown";
    CameraView[CameraView["perspective"] = 1] = "perspective";
    CameraView[CameraView["everything"] = 2] = "everything";
})(CameraView || (CameraView = {}));
var Direction;
(function (Direction) {
    Direction[Direction["down"] = 0] = "down";
    Direction[Direction["left"] = 1] = "left";
    Direction[Direction["right"] = 2] = "right";
    Direction[Direction["up"] = 3] = "up";
})(Direction || (Direction = {}));
function opposite(d) {
    if (d === Direction.down) {
        return Direction.up;
    }
    else if (d === Direction.left) {
        return Direction.right;
    }
    else if (d === Direction.right) {
        return Direction.left;
    }
    return Direction.down;
}
function left(d) {
    if (d === Direction.down) {
        return Direction.right;
    }
    else if (d === Direction.left) {
        return Direction.down;
    }
    else if (d === Direction.right) {
        return Direction.up;
    }
    return Direction.left;
}
function right(d) {
    if (d === Direction.down) {
        return Direction.left;
    }
    else if (d === Direction.left) {
        return Direction.up;
    }
    else if (d === Direction.right) {
        return Direction.down;
    }
    return Direction.right;
}
function newDirection(curr, next) {
    if (next === Direction.up) {
        return curr;
    }
    else if (next === Direction.down) {
        return opposite(curr);
    }
    else if (next === Direction.left) {
        return left(curr);
    }
    return right(curr);
}
class Board {
    constructor(polygons, obstacles, teleporters, bounds) {
        this.polygons = polygons;
        this.obstacles = obstacles;
        this.teleporters = teleporters;
        this.bounds = bounds;
        this.polygons = this.polygons.concat(obstacles.map(o => o.polygon));
    }
    hasObstacleAtLocation(loc) {
        for (let obstacle of this.obstacles) {
            if (obstacle.boundingBox.containsLocation(loc)) {
                return true;
            }
        }
        return false;
    }
    getTeleporter(loc) {
        for (let teleporter of this.teleporters) {
            if (teleporter.location.equals(loc)) {
                return teleporter;
            }
        }
        return null;
    }
}
class Game {
    constructor(textures, scene, board, player, aspect, scoreListener) {
        this.textures = textures;
        this.scene = scene;
        this.board = board;
        this.player = player;
        this.aspect = aspect;
        this.scoreListener = scoreListener;
        this.score = 0;
        this.initializeGame();
    }
    move(direction) {
        let next = newDirection(this.player.facing, direction);
        let newLoc = this.getNewLoc(this.player.location, this.player.facing);
        let teleporter = this.board.getTeleporter(newLoc);
        let changedDirection = false;
        if (this.player.facing !== next) {
            this.player.facing = next;
            changedDirection = true;
        }
        else if (this.isValidLoc(newLoc)) {
            this.player.setLocation(newLoc);
        }
        if (teleporter && changedDirection == false) {
            this.player.setLocation(teleporter.endLocation);
        }
        this.eatFoodIfExists(this.player.location);
        this.render();
    }
    setCamera(cameraView) {
        this.cameraView = cameraView;
        this.adjustCamera();
        this.render();
    }
    initializeGame() {
        this.cameraView = CameraView.perspective;
        this.food = this.generateFood(this.textures.PELLET);
        let shapes = [];
        shapes.push(this.player.polygon);
        shapes = shapes.concat(this.board.polygons);
        shapes = shapes.concat(this.food.map(f => f.polygon));
        this.scene.addShapes(shapes);
        this.scene.transform(mult(translate(-5, -5, 0), scalem(2, 2, 2)));
        this.render();
    }
    reset() {
        this.player.reset();
        this.score = 0;
        this.scoreListener(this.score);
        for (let f of this.food) {
            f.polygon.setVisibility(true);
        }
        this.render();
    }
    render() {
        this.adjustCamera();
        this.scene.render();
    }
    eatFoodIfExists(loc) {
        for (let f of this.food) {
            if (f.location.equals(loc)) {
                if (f.polygon.isVisible()) {
                    this.score++;
                    this.scoreListener(this.score);
                    f.polygon.setVisibility(false);
                }
                return;
            }
        }
    }
    getNewLoc(loc, direction) {
        let newLoc = new GameLocation(loc.x, loc.y);
        if (direction === Direction.up) {
            newLoc.y++;
        }
        else if (direction === Direction.down) {
            newLoc.y--;
        }
        else if (direction === Direction.left) {
            newLoc.x--;
        }
        else {
            newLoc.x++;
        }
        return newLoc;
    }
    adjustCamera() {
        let NEAR = -10;
        let FAR = 10;
        let LEFT = -6.0;
        let RIGHT = 6.0;
        let YTOP = 6.0;
        let BOTTOM = -6.0;
        if (this.cameraView === CameraView.perspective) {
            this.player.polygon.setVisibility(false);
            let eye = this.toCamCoords(this.player.location);
            let at = this.toCamCoords(this.getNewLoc(this.player.location, this.player.facing));
            let projectionMatrix = ortho(LEFT, RIGHT, BOTTOM, YTOP, NEAR, FAR);
            projectionMatrix = mult(projectionMatrix, perspective(25, this.aspect, -2, 2));
            let mvMatrix = lookAt(eye, at, vec3(0, 0, 1));
            this.scene.setPMatrix(projectionMatrix);
            this.scene.setMVMatrix(mvMatrix);
        }
        else if (this.cameraView === CameraView.topDown) {
            let eye = this.toCamCoords(this.player.location);
            let at = eye.slice();
            eye[2] += 2;
            this.player.polygon.setVisibility(true);
            this.scene.setPMatrix(ortho(LEFT, RIGHT, BOTTOM, YTOP, NEAR, FAR));
            let mvMatrix = lookAt(eye, at, vec3(0, 1, 1));
            this.scene.setMVMatrix(mvMatrix);
        }
        else {
            LEFT = -this.board.bounds.upperBound.x - 5;
            RIGHT = this.board.bounds.upperBound.x + 5;
            YTOP = this.board.bounds.upperBound.y + 5;
            BOTTOM = -this.board.bounds.upperBound.y - 5;
            this.player.polygon.setVisibility(true);
            this.scene.setPMatrix(ortho(LEFT, RIGHT, BOTTOM, YTOP, NEAR, FAR));
            this.scene.setMVMatrix(translate(-this.board.bounds.upperBound.x + 2, -this.board.bounds.upperBound.y + 2, 0));
        }
    }
    toCamCoords(location) {
        return vec3(-4 + location.x * 2, -4 + location.y * 2, 4);
    }
    generateFood(texture) {
        let foodBase = [1.5, 1.5, 5];
        let foodOffset = [4, 4, 0];
        let foodLocations = [];
        for (let i = this.board.bounds.lowerBound.x; i <= this.board.bounds.upperBound.x; i++) {
            for (let j = this.board.bounds.lowerBound.y; j <= this.board.bounds.upperBound.y; j++) {
                let loc = new GameLocation(i, j);
                if (!this.board.hasObstacleAtLocation(loc) && !this.player.location.equals(loc)) {
                    foodLocations.push(loc);
                }
            }
        }
        return foodLocations.map(fl => {
            let square = makeSquare(texture);
            square.transform(mult(scalem(0.25, 0.25, 0.25), translate(foodBase[0] + fl.x * foodOffset[0], foodBase[1] + fl.y * foodOffset[1], foodBase[2])));
            return new GameElement(square, fl);
        });
    }
    isValidLoc(loc) {
        if (this.board.hasObstacleAtLocation(loc)) {
            return false;
        }
        return this.board.bounds.containsLocation(loc);
    }
}
class BufferManager {
    constructor(vBuffer, tBuffer) {
        this.vBuffer = vBuffer;
        this.tBuffer = tBuffer;
        this.count = 0;
    }
}
class Polygon {
    constructor(vertices, textureCoordinates, texture) {
        this.vertices = vertices;
        this.textureCoordinates = textureCoordinates;
        this.texture = texture;
        this.visible = true;
        this.modified = true;
    }
    isModified() {
        return this.modified;
    }
    setVisibility(visibility) {
        this.visible = visibility;
    }
    isVisible() {
        return this.visible;
    }
    size() {
        return this.vertices.length;
    }
    transform(mat) {
        let translation = curry(matTimesVec, mat);
        this.vertices = this.vertices.map(translation);
        this.modified = true;
    }
}
class Scene {
    constructor(bufferManager, uniformModelViewMatrixLocation, modelViewMatrix, uniformPerspectiveMatrixLocation, perspectiveMatrix) {
        this.bufferManager = bufferManager;
        this.uniformModelViewMatrixLocation = uniformModelViewMatrixLocation;
        this.modelViewMatrix = modelViewMatrix;
        this.uniformPerspectiveMatrixLocation = uniformPerspectiveMatrixLocation;
        this.perspectiveMatrix = perspectiveMatrix;
        this.polygons = [];
        this.vertexCount = 0;
        this.setMVMatrix(modelViewMatrix);
        this.setPMatrix(perspectiveMatrix);
    }
    addShape(polygon) {
        polygon.startIndex = this.vertexCount;
        this.polygons.push(polygon);
        this.vertexCount += polygon.vertices.length;
    }
    addShapes(polygons) {
        for (let polygon of polygons) {
            polygon.startIndex = this.vertexCount;
            this.vertexCount += polygon.vertices.length;
        }
        this.polygons = this.polygons.concat(polygons);
    }
    transform(matrix) {
        for (let shape of this.polygons) {
            shape.transform(matrix);
        }
    }
    render() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        for (let polygon of this.polygons) {
            if (polygon.isVisible()) {
                if (polygon.isModified()) {
                    this.updateBuffer(polygon);
                }
                this.draw(polygon);
            }
        }
    }
    updateBuffer(polygon) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferManager.vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, polygon.startIndex * 16, flatten(polygon.vertices));
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferManager.tBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, polygon.startIndex * 8, flatten(polygon.textureCoordinates));
        polygon.modified = false;
    }
    draw(polygon) {
        if (polygon.visible) {
            gl.bindTexture(gl.TEXTURE_2D, polygon.texture);
            gl.drawArrays(gl.TRIANGLES, polygon.startIndex, polygon.vertices.length);
        }
    }
    setMVMatrix(matrix) {
        this.modelViewMatrix = matrix;
        gl.uniformMatrix4fv(this.uniformModelViewMatrixLocation, false, flatten(matrix));
    }
    setPMatrix(matrix) {
        this.perspectiveMatrix = matrix;
        gl.uniformMatrix4fv(this.uniformPerspectiveMatrixLocation, false, flatten(matrix));
    }
}
function triangle(a, b, c) {
    return {
        points: [a, b, c],
        texCoords: [vec2(0, 0), vec2(0, 1), vec2(1, 1)]
    };
}
function divideTriangle(a, b, c, n) {
    if (n <= 0) {
        return triangle(a, b, c);
    }
    let ab = mix(a, b, 0.5);
    let ac = mix(a, c, 0.5);
    let bc = mix(b, c, 0.5);
    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);
    var results = [
        divideTriangle(a, ab, ac, n - 1),
        divideTriangle(ab, b, bc, n - 1),
        divideTriangle(bc, c, ac, n - 1),
        divideTriangle(ab, bc, ac, n - 1)
    ];
    return results.reduce((prev, curr) => {
        prev.points = prev.points.concat(curr.points);
        prev.texCoords = prev.texCoords.concat(curr.texCoords);
        return prev;
    }, { points: [], texCoords: [] });
}
function makeSphere(texture) {
    let a = vec4(0.0, 0.0, -1.0, 1);
    let b = vec4(0.0, 0.942809, 0.333333, 1);
    let c = vec4(-0.816497, -0.471405, 0.333333, 1);
    let d = vec4(0.816497, -0.471405, 0.333333, 1);
    let results = [
        divideTriangle(a, b, c, 4),
        divideTriangle(d, c, b, 4),
        divideTriangle(a, d, b, 4),
        divideTriangle(a, c, d, 4)
    ];
    let vals = results.reduce((prev, curr) => {
        prev.points = prev.points.concat(curr.points);
        prev.texCoords = prev.texCoords.concat(curr.texCoords);
        return prev;
    }, { points: [], texCoords: [] });
    return new Polygon(vals.points, vals.texCoords, texture);
}
function makeSquare(texture) {
    let vertices = [
        vec4(0, 0, 1, 1),
        vec4(0, 1, 1, 1),
        vec4(1, 1, 1, 1),
        vec4(1, 0, 1, 1),
        vec4(0, 0, 0, 1),
        vec4(0, 1, 0, 1),
        vec4(1, 1, 0, 1),
        vec4(1, 0, 0, 1)
    ];
    let sides = [[1, 0, 3, 2], [2, 3, 7, 6], [3, 0, 4, 7], [6, 5, 1, 2], [4, 5, 6, 7], [5, 4, 0, 1]];
    let result = sides.reduce(function (acc, side) {
        let result = quad(side[0], side[1], side[2], side[3], vertices);
        acc.points = acc.points.concat(result.points);
        acc.texCoords = acc.texCoords.concat(result.texCoords);
        return acc;
    }, { points: [], texCoords: [] });
    return new Polygon(result.points, result.texCoords, texture);
}
function quad(a, b, c, d, vertices) {
    let p = [];
    let indices = [a, b, c, a, c, d];
    for (let i = 0; i < indices.length; ++i) {
        p.push(vertices[indices[i]]);
    }
    let quadTexCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(1, 0)];
    return {
        points: p,
        texCoords: quadTexCoord
    };
}
function matTimesVec(m, vec) {
    let newVec = vec4(0, 0, 0, 1.0);
    newVec[0] = dot(m[0], vec);
    newVec[1] = dot(m[1], vec);
    newVec[2] = dot(m[2], vec);
    return newVec;
}
function curry(uncurried, ...args) {
    let params = args;
    return (...args) => {
        return uncurried.apply(this, params.concat(args));
    };
}
;
function generateTextures() {
    let textures = {
        WOOD: null,
        BRICK: null,
        BLACK: null,
        PACMAN: null,
        PELLET: null
    };
    for (let key in textures) {
        textures[key] = configureTexture(document.getElementById(key));
    }
    return textures;
}
function configureTexture(image) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    // gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    return texture;
}
function initialize() {
    let canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    let maxPoints = 1000000;
    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxPoints, gl.STATIC_DRAW);
    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    let uPMatrix = gl.getUniformLocation(program, "uPMatrix");
    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxPoints, gl.STATIC_DRAW);
    let vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    let uMVMatrix = gl.getUniformLocation(program, "uMVMatrix");
    return {
        vBuffer: vBuffer,
        tBuffer: tBuffer,
        uMVMatrix: uMVMatrix,
        uPMatrix: uPMatrix,
        aspect: canvas.width / canvas.height
    };
}
//# sourceMappingURL=proj7.js.map