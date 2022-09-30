// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotateX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	var rotateY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	
	var rotation = MatrixMult(rotateX, rotateY);
	// we need apply translation first then apply rotation
	var mv = trans;
 	mv = MatrixMult(mv, rotation);
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram(meshVS, meshFS);

		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.mv = gl.getUniformLocation(this.prog, 'mv');
		this.camDir = gl.getUniformLocation(this.prog, 'camDir');
		this.swap = gl.getUniformLocation(this.prog, 'swap');
		this.showTex = gl.getUniformLocation(this.prog, 'show_texture');
		this.sampler = gl.getUniformLocation( this.prog, 'tex' );
		this.normalSampler = gl.getUniformLocation( this.prog, 'normalTex' );
		this.shininess = gl.getUniformLocation( this.prog, 'shininess' );
		this.lightDir= gl.getUniformLocation( this.prog, 'lightDir' );
		
		this.m_tan_pos = gl.getAttribLocation( this.prog, 'm_tan' );
		this.m_bitan_pos = gl.getAttribLocation( this.prog, 'm_bitan' );
		this.m_normal = gl.getAttribLocation( this.prog, 'm_normal' );
		this.m_vertPos = gl.getAttribLocation( this.prog, 'm_vertPos' );
		this.texCoords = gl.getAttribLocation( this.prog, 'txc' );
		console.log(this.m_normal);

		this.vertbuffer = gl.createBuffer();
		this.coordbuffer = gl.createBuffer();
		this.normalbuffer = gl.createBuffer();
		this.tanBuffer = gl.createBuffer();
		this.bitanBuffer = gl.createBuffer();

		this.texture = gl.createTexture();
		this.normalTex = gl.createTexture();

		gl.useProgram(this.prog);
		gl.uniform1i( this.showTex, 1);
		gl.uniformMatrix4fv(this.swap, false, [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);

	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals, tans, bitans )
	{
		// Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		
		console.log(this.m_tan_pos)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.coordbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tanBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tans), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bitanBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitans), gl.STATIC_DRAW);

		this.showTexture(false);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		if(swap)
			gl.uniformMatrix4fv(this.swap, false, 	[1,0,0,0,
													0,0,1,0,
													0,1,0,0,
													0,0,0,1]);
		else
			gl.uniformMatrix4fv(this.swap, false, [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
		gl.uniformMatrix4fv( this.mv, false, matrixMV );
		gl.uniform3fv( this.camDir, [matrixMV[2], matrixMV[6], matrixMV[8]]);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.vertexAttribPointer( this.m_vertPos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.m_vertPos );

		gl.bindBuffer(gl.ARRAY_BUFFER, this.coordbuffer);
		gl.vertexAttribPointer( this.texCoords, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.texCoords );

		//for normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
		gl.vertexAttribPointer( this.m_normal, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.m_normal );
		
		// tangent bitangent
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tanBuffer);
		gl.vertexAttribPointer( this.m_tan_pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.m_tan_pos );
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bitanBuffer);
		gl.vertexAttribPointer( this.m_bitan_pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.m_bitan_pos );
		
		
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.normalTex);
		

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		
		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

		// Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.sampler, 0);

		this.showTexture(true);
	}
	
	SetNormal( img )
	{
		// Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, this.normalTex);
		
		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		
		// Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.normalSampler, 1);
		
		this.showTexture(true);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		gl.uniform1i( this.showTex, show);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3fv( this.lightDir, [x, y, z]);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f( this.shininess, shininess);
	}
}

var meshVS = `
	uniform mat4 swap;
	uniform mat4 mvp;
	
	attribute vec3 m_vertPos;
	attribute vec3 m_tan;
	attribute vec3 m_bitan;
	attribute vec2 txc;
	attribute vec3 m_normal;
	
	varying vec2 texCoord;
	varying vec3 vertexNormal;
	varying mat3 tan_to_m;
	
	mat3 transMat3( mat3 m ){
		return mat3(
		    vec3(m[0].x, m[1].x, m[2].x),
		    vec3(m[0].y, m[1].y, m[2].y),
		    vec3(m[0].z, m[1].z, m[2].z));
	}

	void main()
	{
		vec3 face_normal = normalize(cross(m_tan, m_bitan));
		vec3 m_tan = normalize(m_tan);
		vec3 m_bitan = normalize(m_bitan);
		tan_to_m = mat3(-m_tan, m_bitan, face_normal);
		
		texCoord = txc;
		
		gl_Position = mvp* swap * vec4(m_vertPos,1);
		vertexNormal = m_normal;
	}
	
	
`;
// Fragment shader source code
var meshFS = `
	precision mediump float;

	//for texture
	uniform bool show_texture;
	uniform sampler2D tex;
	uniform sampler2D normalTex;
	uniform vec3 camDir;
	uniform mat4 mv;

	varying mat3 tan_to_m;
	varying vec2 texCoord;
	varying vec3 vertexNormal;

	uniform vec3 lightDir;
	uniform float shininess;

	void main()
	{
		vec4 white = vec4(1,1,1,1);
		vec4 normalByTex = texture2D( normalTex, texCoord );
		normalByTex = normalByTex * 2.0 - 1.0;
		vec4 difuss_color = texture2D( tex, texCoord);
		
		vec3 m_normal = tan_to_m * normalByTex.xyz;
		vec3 v_normal = mat3(mv) * m_normal;
		if(show_texture)
			difuss_color = texture2D( tex, texCoord);
		else
			difuss_color = white;
			
		float costheta = dot(v_normal, lightDir)/(length(v_normal) * length(lightDir));
		
		vec4 difuss_component =  max(costheta, 0.0) * difuss_color;
		vec3 h = (lightDir + camDir) / length(dot(lightDir, camDir));
		float cosphi = dot(v_normal, h)/(length(v_normal)*length(h));
		vec4 sep_component = white * pow(max(cosphi, 0.0), shininess);
		
		
		//gl_FragColor = vec4(m_normal, 1);
		gl_FragColor = difuss_component + sep_component;
		//gl_FragColor = normalByTex;
	}
`;
