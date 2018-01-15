/*
	a² + b² = c²
	½² + h² = 1²
	¼ + h² = 1
	h² = 1 - ¼
	h = sqrt(1 - ¼)
	h = sqrt(3/4)
	h = sqrt(3) / sqrt(4)
	h = sqrt(3) / 2
*/
const float triaHeight = sqrt(3.0) / 2.0;

/*
	h_i = sqrt(3) / 2
	h_o = ½
	h_i * cos(a) = h_o
	cos(a) = h_o / h_i
	a = acos(h_o / h_i)
	a = acos(½ / (sqrt(3) / 2)) 
	a = acos(1 / sqrt(3))
*/
const float viewAngle = acos(1.0 / sqrt(3.0));

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

vec3 mapToWorld(vec2 mapCoord, float height)
{
	vec3 worldPos;
	
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

vec3 worldToShadow(vec3 worldPos, float zoom, vec2 cameraPos, vec2 screenSize)
{
	vec3 uniX = rotateX(rotateZ(vec3(1,0,0), radians(-30.0)), radians(45.0));
	vec3 uniY = rotateX(rotateZ(vec3(0,1,0), radians(-30.0)), radians(45.0));
	vec3 uniZ = rotateX(rotateZ(vec3(0,0,1), radians(-30.0)), radians(45.0));
	vec3 sunPos;
	
	sunPos = worldPos;
	
	sunPos = rotateZ(sunPos, radians(-30.0));
	sunPos = rotateX(sunPos, radians(45.0));
	sunPos.xyz -= sunPos.yxx * vec3(uniY.x, uniX.y, uniX.y) / vec3(uniY.y, uniX.x, uniX.x);
	sunPos.z += sunPos.y * uniZ.z / uniZ.y;
	sunPos.xy *= vec2(uniX.x, uniY.y * 2.0);
	sunPos.z *= uniZ.z;
	sunPos.z /= 255.0;
	
	sunPos.y /= triaHeight * 2.;
	
	sunPos.xy -= cameraPos;
	sunPos.xy *= zoom;
	//sunPos.z -= cameraPos.y / sin(viewAngle) / triaHeight;
	//sunPos.z *= triaHeight * sin(viewAngle) * zoom;
	
	sunPos.xy /= screenSize / 2.0;
	sunPos.y *= -1.0;
	//sunPos.z /= screenSize.y / 2.0;
	
	return sunPos;
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

