import display from "./gfxlib/display.js";
import * as ma from "./utils/math.js";
import * as mm from "./math.js";

class Camera
{
	constructor()
	{
		this.zoom = 1;
		this.pos = new Float32Array(2);
		this._mat = new Float32Array(16);
		this._screenMat = new Float32Array(16);
		
		display.frame(() => this.update());
	}
	
	get totalZoom()
	{
		return this.zoom * mm.stdDefZoom;
	}
	
	update()
	{
		let totalZoom = this.totalZoom;
		
		this._identity();
		this._rotatex(mm.viewAngle);
		this._translate(-this.pos[0], -this.pos[1], 0);
		this._scale(totalZoom, totalZoom, 0);
		this._screenMat.set(this._mat);
		this._translate(display.width / 2, display.height / 2, 0, this._screenMat);
		this._scale(2 / display.width, -2 / display.height, 0);
	}
	
	worldToScreen(p, o = new Float32Array(2))
	{
		return this.transform2D(p, this._screenMat, o);
	}
	
	transform3D(p, m = this._mat, o = new Float32Array(4))
	{
		let x = p[0];
		let y = p[1];
		let z = p[2];
		
		o[0] = x * m[0] + y * m[1] + z * m[2]  + m[3];
		o[1] = x * m[4] + y * m[5] + z * m[6]  + m[7];
		o[2] = x * m[8] + y * m[9] + z * m[10] + m[11];
		o[3] = 1;
		
		return o;
	}
	
	transform2D(p, m = this._mat, o = new Float32Array(2))
	{
		let x = p[0];
		let y = p[1];
		let z = p[2];
		
		o[0] = x * m[0] + y * m[1] + z * m[2]  + m[3];
		o[1] = x * m[4] + y * m[5] + z * m[6]  + m[7];
		
		return o;
	}
	
	_identity()
	{
		this._mat[0] = 1;
		this._mat[1] = 0;
		this._mat[2] = 0;
		this._mat[3] = 0;
		
		this._mat[4] = 0;
		this._mat[5] = 1;
		this._mat[6] = 0;
		this._mat[7] = 0;
		
		this._mat[8] = 0;
		this._mat[9] = 0;
		this._mat[10] = 1;
		this._mat[11] = 0;
		
		this._mat[12] = 0;
		this._mat[13] = 0;
		this._mat[14] = 0;
		this._mat[15] = 1;
	}
	
	_translate(x, y, z, o = this._mat)
	{
		o[3]  += x;
		o[7]  += y;
		o[11] += z;
	}
	
	_scale(x, y, z)
	{
		this._mat[0] *= x;
		this._mat[1] *= x;
		this._mat[2] *= x;
		this._mat[3] *= x;
		
		this._mat[4] *= y;
		this._mat[5] *= y;
		this._mat[6] *= y;
		this._mat[7] *= y;
		
		this._mat[8] *= z;
		this._mat[9] *= z;
		this._mat[10] *= z;
		this._mat[11] *= z;
	}
	
	_rotatex(a)
	{
        let sina = ma.sin(a);
        let cosa = ma.cos(a);
        
        let y0 = this._mat[4];
        let y1 = this._mat[5];
        let y2 = this._mat[6];
        let y3 = this._mat[7];
        
        let z0 = this._mat[8];
        let z1 = this._mat[9];
        let z2 = this._mat[10];
        let z3 = this._mat[11];
        
		this._mat[4] = y0 * cosa - z0 * sina;
		this._mat[5] = y1 * cosa - z1 * sina;
		this._mat[6] = y2 * cosa - z2 * sina;
		this._mat[7] = y3 * cosa - z3 * sina;
		
		this._mat[8] = y0 * cosa + z0 * sina;
		this._mat[9] = y1 * cosa + z1 * sina;
		this._mat[10] = y2 * cosa + z2 * sina;
		this._mat[11] = y3 * cosa + z3 * sina;
	}
}

export default new Camera();
