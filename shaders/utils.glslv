const float triaHeight = sqrt(3.0) / 2.0;
const float viewAngle = acos(1.0 / sqrt(3.0));
const float heightScale = 1.0 / 3.0;

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

vec2 mapLocalToGlobal(vec2 mapLocal, vec2 chunkCoord, float chunkSize)
{
	return mapLocal + chunkCoord * chunkSize * vec2(1.0, 2.0);
}

vec3 mapToWorld(vec2 mapCoord, float height)
{
	vec3 p = vec3(mapCoord, height);
	
	if(mod(floor(p.y), 2.0) == 0.0)
		p.x += fract(p.y) * 0.5;
	else
		p.x += 0.5 - fract(p.y) * 0.5;

	p.yz *= vec2(triaHeight, heightScale);
	
	return p;
}

vec2 worldToScreen(vec3 worldPos, float zoom, float stdDefZoom, vec2 cameraPos, vec2 screenSize)
{
	vec2 p = rotateX(worldPos, viewAngle).xy;
	
	p *= zoom * stdDefZoom;
	p -= cameraPos * zoom;
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

