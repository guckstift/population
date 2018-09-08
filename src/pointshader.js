var pointVert = `
	uniform vec2 uTexSizes[8];
	uniform vec2 uScreenSize;
	uniform float uStdDefZoom;
	uniform vec2 uCameraPos;
	
	attribute vec3 aWorldPos;
	attribute vec2 aFramePos;
	attribute vec2 aFramePad;
	attribute vec2 aFrameSize;
	attribute float aSize;
	attribute float aTexId;
	
	varying float vTexId;
	varying vec2 vPtCoordSize;
	varying vec2 vPtCoordPos;
	varying vec2 vPtBoundLT;
	varying vec2 vPtBoundRB;
	
	void main()
	{
		vec2 screenPos = worldToScreen(aWorldPos, uStdDefZoom, uCameraPos, uScreenSize);
		vec3 clipPos   = screenToClip(screenPos, uScreenSize);
		
		gl_Position  = vec4(clipPos, 1.0);
		gl_PointSize = aSize;
		
		vTexId = aTexId;
		
		for(int i=0; i<8; i++) {
			if(i == int(aTexId)) {
				vPtCoordSize = aSize / uTexSizes[i];
				vPtCoordPos  = (aFramePos - aFramePad) / uTexSizes[i];
				vPtBoundLT   = aFramePad / aSize;
				vPtBoundRB   = (aFramePad + aFrameSize) / aSize;
				break;
			}
		}
	}
`;

var pointFrag = `
	precision highp float;
	
	uniform sampler2D uTextures[8];
	
	varying float vTexId;
	varying vec2 vPtCoordSize;
	varying vec2 vPtCoordPos;
	varying vec2 vPtBoundLT;
	varying vec2 vPtBoundRB;
	
	void main()
	{
		if(all(greaterThanEqual(gl_PointCoord, vPtBoundLT))
		&& all(lessThan(gl_PointCoord, vPtBoundRB))
		) {
			for(int i=0; i<8; i++) {
				if(i == int(vTexId)) {
					gl_FragColor = texture2D(
						uTextures[i],
						gl_PointCoord * vPtCoordSize + vPtCoordPos
					);
					
					break;
				}
			}
		}
		else {
			discard;
		}
	}
`;
