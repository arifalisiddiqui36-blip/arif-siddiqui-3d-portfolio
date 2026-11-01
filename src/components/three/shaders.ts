// Ashima / Stefan Gustavson 3D simplex noise (MIT).
export const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

/**
 * The hero "data core": a sphere whose surface is displaced by layered noise.
 * The pointer pushes a soft dent into the surface; colour comes from a
 * fresnel rim that shifts from violet to sky blue, with faint latitude
 * bands that read like scan lines on a planet-scale machine.
 */
export const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform vec3 uPointer;   // pointer position on the sphere, in object space
uniform float uPointerStrength;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisp;
varying vec3 vPos;
varying vec3 vWorld;

${simplexNoise}

float field(vec3 p){
  float n = snoise(p * 1.1 + vec3(0.0, uTime * 0.18, 0.0)) * 0.6;
  n += snoise(p * 2.6 - vec3(uTime * 0.12)) * 0.25;
  n += snoise(p * 6.0 + vec3(uTime * 0.25)) * 0.06;
  return n;
}

void main(){
  vec3 p = position;
  vec3 n = normalize(normal);
  float d = field(n);
  float dent = smoothstep(0.9, 0.0, distance(n, uPointer)) * uPointerStrength;
  float disp = d * uAmp + dent * 0.22;
  vec3 displaced = p + n * disp;

  vec4 world = modelMatrix * vec4(displaced, 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * n);
  vViewDir = normalize(cameraPosition - world.xyz);
  vDisp = disp;
  vPos = displaced;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const coreFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uViolet;
uniform vec3 uSky;
uniform vec3 uDeep;
uniform float uIntro;
varying vec3 vNormal;
varying vec3 vViewDir;
varying float vDisp;
varying vec3 vPos;
varying vec3 vWorld;

void main(){
  // Normal from screen-space derivatives: follows the displaced surface
  // exactly and gives a subtly faceted, "rendered by a machine" finish.
  vec3 faceN = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (dot(faceN, vNormal) < 0.0) faceN = -faceN;
  vec3 Ns = normalize(vNormal);
  vec3 N = normalize(mix(Ns, faceN, 0.6));
  vec3 V = normalize(vViewDir);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);

  // Two coloured key lights for depth.
  vec3 L1 = normalize(vec3(-0.6, 0.8, 0.6));
  vec3 L2 = normalize(vec3(0.9, -0.4, 0.3));
  float d1 = max(dot(N, L1), 0.0);
  float d2 = max(dot(N, L2), 0.0);
  float spec = pow(max(dot(reflect(-L1, Ns), V), 0.0), 60.0);

  vec3 col = uDeep;
  col += uViolet * pow(d1, 1.5) * 0.32;
  col += uSky * pow(d2, 2.0) * 0.16;
  vec3 rim = mix(uViolet, uSky, smoothstep(-0.15, 0.3, vDisp + vPos.y * 0.15));
  col += rim * fres * 1.15;
  col += vec3(0.85, 0.8, 1.0) * spec * 0.25;

  // Latitude scan bands drifting slowly upward.
  float band = smoothstep(0.965, 1.0, sin(vPos.y * 24.0 - uTime * 1.2) * 0.5 + 0.5);
  col += mix(uViolet, uSky, 0.6) * band * (0.06 + fres * 0.35);

  // Ridges catch a little light.
  col += uSky * smoothstep(0.2, 0.34, vDisp) * 0.18;

  gl_FragColor = vec4(col * uIntro, 1.0);
}
`;

/** Soft round particles with per-particle twinkle. */
export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
attribute float aScale;
attribute float aSpeed;
attribute float aMix;
varying float vMix;
varying float vAlpha;

void main(){
  vec3 p = position;
  float a = uTime * aSpeed;
  float c = cos(a), s = sin(a);
  p.xz = mat2(c, -s, s, c) * p.xz;
  p.y += sin(uTime * 0.6 + aScale * 12.0) * 0.08;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (1.0 / -mv.z);
  vMix = aMix;
  vAlpha = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 2.0 + aScale * 40.0));
}
`;

export const particleFragment = /* glsl */ `
uniform vec3 uViolet;
uniform vec3 uSky;
uniform float uOpacity;
varying float vMix;
varying float vAlpha;

void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.6);
  vec3 col = mix(uViolet, uSky, vMix) + vec3(0.25) * smoothstep(0.2, 0.0, d);
  gl_FragColor = vec4(col, a * vAlpha * uOpacity);
}
`;
