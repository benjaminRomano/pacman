interface Textures {
        WOOD: WebGLTexture;
        BRICK: WebGLTexture;
        BLACK: WebGLTexture;
        PACMAN: WebGLTexture;
        PELLET: WebGLTexture;
}

declare var WebGLUtils: {
    setupWebGL: (HTMLCanvasElement) => WebGLRenderingContext;
};

declare function initShaders(gl: WebGLRenderingContext, v: string, f: string): WebGLProgram;

declare function _argumentsToArray(args: any): any;
declare function radians(degrees: any): number;
declare function vec2(x: number, y: number): any;
declare function vec3(x: number, y: number, z: number): any;
declare function vec4(x: number, y: number, z: number, a: number): any;
declare function mat2(): any;
declare function mat3(): any;
declare function mat4(): any;
declare function equal(u: any, v: any): boolean;
declare function add(u: any, v: any): any[];
declare function subtract(u: any, v: any): any[];
declare function mult(u: any, v: any): any[];
declare function translate(x: any, y: any, z: any): any[];
declare function rotate(angle: any, axis: any): any;
declare function rotateX(theta: any): any;
declare function rotateY(theta: any): any;
declare function rotateZ(theta: any): any;
declare function scalem(x: any, y: any, z: any): any[];
declare function lookAt(eye: any, at: any, up: any): any;
declare function ortho(left: any, right: any, bottom: any, top: any, near: any, far: any): any[];
declare function perspective(fovy: any, aspect: any, near: any, far: any): any[];
declare function transpose(m: any): string | any[];
declare function dot(u: any, v: any): number;
declare function negate(u: any): any[];
declare function cross(u: any, v: any): number[];
declare function length(u: any): number;
declare function normalize(u: any, excludeLastComponent: any): any;
declare function mix(u: any, v: any, s: any): any[];
declare function scalex(s: any, u: any): any[];
declare function flatten(v: any): Float32Array;
declare var sizeof: {
    'vec2': number;
    'vec3': number;
    'vec4': number;
    'mat2': number;
    'mat3': number;
    'mat4': number;
};
declare function printm(m: any): void;
declare function det2(m: any): number;
declare function det3(m: any): number;
declare function det4(m: any): number;
declare function det(m: any): number;
declare function inverse2(m: any): any[];
declare function inverse3(m: any): any[];
declare function inverse4(m: any): any[];
declare function inverse(m: any): any[];
declare function normalMatrix(m: any, flag: any): any[];
