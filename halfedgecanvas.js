/**
 * 
 * @param {DOM Element} glcanvas Handle to HTML where the glcanvas resides
 * @param {string} shadersrelpath Path to the folder that contains the shaders,
 *                                relative to where the constructor is being called
 */

DRAW_OFFSET = 1.001; // Draw points at a slight multiplicative offset for debugging
LINE_WIDTH = 4;

function HalfEdgeCanvas(glcanvas, shadersrelpath) {
    BaseCanvas(glcanvas, shadersrelpath);
    glcanvas.mesh = new HedgeMesh();
    glcanvas.camera = new MousePolarCamera(glcanvas.width, glcanvas.height);
    glcanvas.drawer = new SimpleDrawer(glcanvas.gl, glcanvas.shaders);
    glcanvas.faceDrawer = new BasicMesh();

    /////////////////////////////////////////////////////
    //Step 1: Setup repaint function
    /////////////////////////////////////////////////////    

    /**
     * Code for drawing the mesh and debugging information
     */
    glcanvas.repaint = function() {
        glcanvas.gl.viewport(0, 0, glcanvas.gl.viewportWidth, glcanvas.gl.viewportHeight);
        glcanvas.gl.clear(glcanvas.gl.COLOR_BUFFER_BIT | glcanvas.gl.DEPTH_BUFFER_BIT);
        glcanvas.gl.lineWidth(LINE_WIDTH);

        //NOTE: glcanvas has all options we need except
        //for "shaderToUse"
        glcanvas.shaderToUse = glcanvas.shaders.blinnPhong;
        glcanvas.lights = [{pos:glcanvas.camera.pos, color:[1, 1, 1], atten:[1, 0, 0]}];
        glcanvas.mesh.render(glcanvas);

        let drawer = glcanvas.drawer;
        drawer.reset();
        // Code for showing result of vertex-related traversals
        if (glcanvas.vertTest.showResult) {
            let v = glcanvas.mesh.vertices[glcanvas.vertTest.vertexIndex];
            let p1 = glMatrix.vec3.create();
            let p1_2 = glMatrix.vec3.create();
            glMatrix.vec3.scale(p1, v.pos, DRAW_OFFSET);
            glMatrix.vec3.scale(p1_2, v.pos, 1.0/DRAW_OFFSET);
            drawer.drawPoint(p1, [1, 0, 0]);
            if (glcanvas.vertTest.type == 'getVertexNeighbors' || glcanvas.vertTest.type == 'getAttachedFaces') {
                let vs = v.getVertexNeighbors();
                for (let i = 0; i < vs.length; i++) {
                    let p2 = glMatrix.vec3.create();
                    let p2_2 = glMatrix.vec3.create();
                    glMatrix.vec3.scale(p2, vs[i].pos, DRAW_OFFSET);
                    glMatrix.vec3.scale(p2_2, vs[i].pos, 1.0/DRAW_OFFSET);
                    drawer.drawLine(p1, p2, [0, 1, 1]);
                    drawer.drawPoint(p2, [0, 1, 1]);
                    drawer.drawLine(p1_2, p2_2, [0, 1, 1]);
                    drawer.drawPoint(p2_2, [0, 1, 1]);
                }
            }
            if (glcanvas.vertTest.type == 'getAttachedFaces') {
                // Draw all attached faces in red
                let faces = v.getAttachedFaces();
                glcanvas.faceDrawer.clear();
                let idx2V = {}; // Convert from mesh index to new vertex in face drawer
                for (let i = 0; i < faces.length; i++) {
                    const f = faces[i];
                    const vs = f.getVertices();
                    let face = [];
                    let face_2 = [];
                    for (let j = 0; j < vs.length; j++) {
                        const v = vs[j];
                        if (!(v.ID in idx2V)) {
                            let p = glMatrix.vec3.create();
                            let p_2 = glMatrix.vec3.create();
                            glMatrix.vec3.scale(p, v.pos, DRAW_OFFSET);
                            glMatrix.vec3.scale(p_2, v.pos, 1.0/DRAW_OFFSET);
                            const vnew = glcanvas.faceDrawer.addVertex(p);
                            const vnew_2 = glcanvas.faceDrawer.addVertex(p_2);
                            idx2V[v.ID] = [vnew, vnew_2];
                        }
                        face.push(idx2V[v.ID][0]);
                        face_2.push(idx2V[v.ID][1])
                    }
                    glcanvas.faceDrawer.addFace(face);
                    glcanvas.faceDrawer.addFace(face_2);
                }
                let materialBefore = glcanvas.material;
                glcanvas.material = {'ka':[1, 1, 0], 'kd':[1, 1, 0]};
                glcanvas.faceDrawer.render(glcanvas);
                glcanvas.material = materialBefore;
            }
        }

        // Code for showing result of face-related traversals
        function drawEdge(edge, color) {
            if (color === undefined) {
                color = [1, 0, 1];
            }
            let vs = edge.getVertices();
            for (let k = 0; k < 2; k++) {
                if (k == 0) {
                    offset = DRAW_OFFSET;
                }
                else {
                    offset = 1.0/DRAW_OFFSET;
                }
                let p1 = glMatrix.vec3.create();
                let p2 = glMatrix.vec3.create();
                glMatrix.vec3.scale(p1, vs[0].pos, DRAW_OFFSET);
                glMatrix.vec3.scale(p2, vs[1].pos, DRAW_OFFSET);
                drawer.drawLine(p1, p2, color);
            }
        }

        if (glcanvas.faceTest.showResult) {
            let face = glcanvas.mesh.faces[glcanvas.faceTest.faceIndex];
            let edges = face.getEdges();
            for (let i = 0; i < edges.length; i++) {
                drawEdge(edges[i]);
            }
        }

        // Code for showing boundary cycles
        if (glcanvas.showBoundaries) {
            let cycles = glcanvas.mesh.getBoundaryCycles();
            for (let i = 0; i < cycles.length; i++) {
                for (let j = 0; j < cycles[i].length; j++) {
                    drawEdge(cycles[i][j], [0, 1, 0.5]);
                }
            }
            glcanvas.genus = glcanvas.mesh.getGenus();
        }
        drawer.repaint(glcanvas.camera);
    }

    glcanvas.centerCamera = function() {
        this.camera.centerOnMesh(this.mesh);
    }

    glcanvas.gui = new dat.GUI();
    const gui = glcanvas.gui;
    // Mesh display options menu
    glcanvas.drawEdges = false;
    glcanvas.drawNormals = false;
    glcanvas.drawVertices = false;
    let meshOpts = gui.addFolder('Mesh Display Options');
    ['drawEdges', 'drawNormals', 'drawPoints'].forEach(
        function(s) {
            let evt = meshOpts.add(glcanvas, s);
            evt.onChange(function() {
                requestAnimFrame(glcanvas.repaint);
            });
        }
    );

    let simpleRepaint = function() {
        requestAnimFrame(glcanvas.repaint);
    }

    // Add tests for mesh traversal
    let travTests = gui.addFolder('Traversal Tests');
    let vertTests = travTests.addFolder('Vertex Tests');
    glcanvas.vertTest = {'vertexIndex':0, 'showResult':false, 'type':'getVertexNeighbors'};
    glcanvas.vertTest.gui = vertTests;
    vertTests.add(glcanvas.vertTest, 'vertexIndex').onChange(function(i) {
        let maxi = glcanvas.mesh.vertices.length-1;
        if (i >= maxi) {
            glcanvas.vertTest.vertexIndex = maxi;
        }
        if (i < 0) {
            glcanvas.vertTest.vertexIndex = 0;
        }
        requestAnimFrame(glcanvas.repaint);
    });
    vertTests.add(glcanvas.vertTest, 'type', ['getVertexNeighbors', 'getAttachedFaces']).onChange(simpleRepaint);
    vertTests.add(glcanvas.vertTest, 'showResult').onChange(simpleRepaint);

    let faceTests = travTests.addFolder('Face Tests');
    glcanvas.faceTest = {'faceIndex':0, 'showResult':false, 'type':'getEdges'};
    glcanvas.faceTest.gui = faceTests;
    faceTests.add(glcanvas.faceTest, 'faceIndex').onChange(function(i) {
        let maxi = glcanvas.mesh.faces.length-1;
        if (i >= maxi) {
            glcanvas.faceTest.faceIndex = maxi;
        }
        if (i < 0) {
            glcanvas.faceTest.faceIndex = 0;
        }
        requestAnimFrame(glcanvas.repaint);
    });
    faceTests.add(glcanvas.faceTest, 'type', ['getEdges']).onChange(simpleRepaint);
    faceTests.add(glcanvas.faceTest, 'showResult').onChange(simpleRepaint);

    let geomMenu = gui.addFolder("Geometric Tasks");
    glcanvas.inflationFac = 0.1;
    glcanvas.inflateDeflate = function() {
        glcanvas.mesh.inflateDeflate(glcanvas.inflationFac);
        requestAnimFrame(glcanvas.repaint);
    }
    glcanvas.laplacianSmooth = function() {
        glcanvas.mesh.laplacianSmoothSharpen(true);
        requestAnimFrame(glcanvas.repaint);
    }
    glcanvas.laplacianSharpen = function() {
        glcanvas.mesh.laplacianSmoothSharpen(false);
        requestAnimFrame(glcanvas.repaint);
    }
    glcanvas.warp = function() {
        glcanvas.mesh.warp();
        requestAnimFrame(glcanvas.repaint);
    }
    geomMenu.add(glcanvas, 'inflationFac', -1, 1);
    geomMenu.add(glcanvas, 'inflateDeflate');
    geomMenu.add(glcanvas, 'laplacianSmooth');
    geomMenu.add(glcanvas, 'laplacianSharpen');
    geomMenu.add(glcanvas, 'warp');

    let topoMenu = gui.addFolder("Topological Tasks");
    glcanvas.showBoundaries = false;
    glcanvas.genus = -1;
    topoMenu.add(glcanvas, 'showBoundaries').onChange(simpleRepaint);
    topoMenu.add(glcanvas, 'genus').listen();
    glcanvas.fillHoles = function() {
        glcanvas.mesh.fillHoles();
        requestAnimFrame(glcanvas.repaint);
    }
    topoMenu.add(glcanvas, 'fillHoles');

    let creationMenu = gui.addFolder("Mesh Creation");
    glcanvas.truncationFac = 0.5;
    creationMenu.add(glcanvas, 'truncationFac', 0.01, 0.99);
    glcanvas.truncate = function() {
        glcanvas.mesh.truncate(glcanvas.truncationFac);
        requestAnimFrame(glcanvas.repaint);
    }
    creationMenu.add(glcanvas, 'truncate');

    glcanvas.subdivideLinear = function() {
        glcanvas.mesh.subdivideLinear();
        requestAnimFrame(glcanvas.repaint);
    }
    creationMenu.add(glcanvas, 'subdivideLinear');
    glcanvas.subdivideLoop = function() {
        glcanvas.mesh.subdivideLoop();
        requestAnimFrame(glcanvas.repaint);
    }
    creationMenu.add(glcanvas, 'subdivideLoop');

    gui.add(glcanvas.mesh, 'saveOffFile').onChange(simpleRepaint);

    requestAnimationFrame(glcanvas.repaint);
}
