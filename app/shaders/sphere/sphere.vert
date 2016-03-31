uniform float amplitude;
float PI = 3.14159265;
float TWOPI = 6.28318531;
float baseRadius = 1.0;
attribute float displacement;

varying vec3 vNormal;
varying vec2 vUv;

void main() {

	vNormal = normal;
	vUv = ( 0.1 + amplitude ) * uv + vec2( amplitude );

	vec3 newPosition = position + amplitude * normal * vec3( displacement );
	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}


