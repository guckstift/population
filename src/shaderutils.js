var shaderUtils = `
	const float triaHeight = sqrt(3.0) / 2.0;
	const float viewAngle  = acos(1.0 / sqrt(3.0));

	vec3 rotateX(vec3 v, float a)
	{
		return vec3(
			v.x,
			v.y * cos(a) - v.z * sin(a),
			v.z * cos(a) + v.y * sin(a)
		);
	}
	
	vec3 mapToWorld(vec2 mapCoord, float height, float heightScale)
	{
		vec3 p = vec3(mapCoord, height);
		if(mod(floor(p.y), 2.0) == 0.0) {
			p.x += fract(p.y) * 0.5;
		}
		else {
			p.x += 0.5 - fract(p.y) * 0.5;
		}
		p.yz *= vec2(triaHeight, heightScale);
		return p;
	}
	
	vec2 worldToScreen(vec3 worldPos, float stdDefZoom, vec2 cameraPos, vec2 screenSize)
	{
		vec2 p = rotateX(worldPos, viewAngle).xy;
		p *= stdDefZoom;
		p -= cameraPos;
		p += screenSize / 2.0;
		return p;
	}

	vec3 screenToClip(vec2 screenPos, vec2 screenSize)
	{
		vec3 p = vec3(screenPos, 0.0);
		p.xy /= screenSize;
		p.xy *= vec2(2.0, -2.0);
		p.xy += vec2(-1.0, 1.0);
		return p;
	}
`;
