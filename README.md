# Laplacian Operator on 3D Mesh

Link to assignment: http://www.ctralie.com/Teaching/CS476_F2019/Assignments/LargeScale2_3DShapeModeling/. <br/>
In this assignment, I have implemented Mesh traversal functions, Geometric processing function.

## Instructions for use -

Requirements : Python, Browser

1) Open powershell / Command prompt.
2) Direct to the main directory in the shell.
3) Type command : "python -m http.server" to start web server.
4) In browser, open localhost:8000/MeshProcessing.html.

## Implementation details -

The mesh data structure used is Half-Edge Mesh. Each edge on a the mesh consitutes of 2 oppositely directed half-edges. These two half-edges lie on two adjacent faces of the edge.

There are 3 classes implemented:-
1) HFace - represents a Face in Half-Edge Mesh,
2) HVertex - represents a Vertex in Half-Edge Mesh,
3) HEdge - represents a Half Edge in the Half-Edge Mesh

### Member functions implemented -

#### HFace
1) face.getEdges() :- Given a face, retrieve all the half-edges associated with it.
2) face.getArea() :- Given a face, calculate area

#### HVertex
1) vertex.getVertexNeighbors() :- For a vertex, retrieve its neighboring vertices as a list of vec3.
2) vertex.getAttachedFaces() :- For a vertex, retrieve the faces associated with it.
3) vertex.getEdgeBetweenVertex(neighbour) :- For a vertex, retrieve the half-edge from given vertex to its neighbor.
4) vertex.getNormal() :- For a vertex, retreive its normal by weight averaging the face normals with corresponding face areas.

### Geometric Processing Functions -

#### Inflate/Deflate - 
Inflate/Deflate the selected vertex along its normal by the given factor.

#### Laplacian Smooth/Sharpen -
Apply laplacion operator on the mesh. The approach followed was Curvature-flow Laplacian Smoothing (using Cotangent weights).

## Results

#### Laplacian operation on face model


| original    | smoothen    | sharpen      |
|-------------|-------------|--------------|
![Face mesh](https://github.com/Utkal97/geometric-processing/blob/main/results/face_original.jpg) | ![Laplacian smoothened face mesh](https://github.com/Utkal97/geometric-processing/blob/main/results/face_smoothened.jpg) | ![Laplacian sharpened face mesh](https://github.com/Utkal97/geometric-processing/blob/main/results/face_sharpened.jpg)


#### Laplacian operation on bunny model

| original    | smoothen    | sharpen      |
|-------------|-------------|--------------|
![Bunny mesh](https://github.com/Utkal97/geometric-processing/blob/main/results/bunny_original.jpg) | ![Laplacian smoothened bunny](https://github.com/Utkal97/geometric-processing/blob/main/results/bunny_smoothened.jpg) | ![Laplacian sharpened bunny](https://github.com/Utkal97/geometric-processing/blob/main/results/bunny_sharpened.jpg)
