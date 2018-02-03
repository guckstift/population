const float triaHeight = sqrt(3.0) / 2.0;
const float viewAngle = acos(1.0 / sqrt(3.0));

float round(float x)
{
	return floor(x + 0.5);
}

vec3 rotateX(vec3 v, float a)
{
	return vec3(
		v.x,
		v.y * cos(a) - v.z * sin(a),
		v.z * cos(a) + v.y * sin(a)
	);
}

vec3 rotateY(vec3 v, float a)
{
	return vec3(
		v.x * cos(a) + v.z * sin(a),
		v.y,
		v.z * cos(a) - v.x * sin(a)
	);
}

vec3 rotateZ(vec3 v, float a)
{
	return vec3(
		v.x * cos(a) - v.y * sin(a),
		v.y * cos(a) + v.x * sin(a),
		v.z
	);
}

vec3 mapToWorld(vec2 mapCoord, vec2 chunkCoord, float chunkSize, float height)
{
	vec3 worldPos;
	
	mapCoord += chunkCoord * vec2(chunkSize, chunkSize * 2.0);
	worldPos = vec3(mapCoord, height / 3.0);
	worldPos.x += 0.5 * mod(mapCoord.y, 2.0);
	worldPos.y *= triaHeight;
	
	return worldPos;
}

vec3 worldToScreen(vec3 worldPos, float zoom, vec2 cameraPos)
{
	vec3 screenPos;
	
	screenPos = worldPos;
	screenPos = rotateX(screenPos, viewAngle);
	screenPos.xy -= cameraPos;
	screenPos.xy *= zoom;
	screenPos.z -= worldPos.y * sin(viewAngle);
	screenPos.z /= cos(viewAngle) * 8.;
	
	return screenPos;
}

vec3 screenToClip(vec3 screenPos, vec2 screenSize)
{
	vec3 clipPos;
	
	clipPos = screenPos;
	clipPos.xy /= screenSize / 2.0;
	clipPos.y *= -1.0;
	//clipPos.z /= screenSize.y / 2.0;
	
	return clipPos;
}

float calcCoeff(vec3 sun, vec3 normal)
{
	return pow(dot(-sun, normal), 2.0) * 1.5;
}

float random2D(vec2 sv)
{
	return fract(
		987654.321 * sin(
			dot(sv, vec2(12.34, 56.78))
		)
	);
}

float random3D(vec3 sv)
{
	return fract(
		987654.321 * sin(
			dot(sv, vec3(12.3, 45.6, 78.9))
		)
	);
}

float noise(vec2 sv, float size)
{
	vec2 i = floor(sv / size) * size;
	vec2 f = sv - i;
	float a = random2D(i);
	float b = random2D(i + vec2(1.0, 0.0));
	float c = random2D(i + vec2(0.0, 1.0));
	float d = random2D(i + vec2(1.0, 1.0));
	
	return mix(
		mix(a,b,f.x),
		mix(c,d,f.x),
		f.y
	);
}

