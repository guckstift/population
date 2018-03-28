this._ = (function(_) {

	_.create = Object.create;
	_.keys = Object.keys;

})(this._ || {});

function implynew(func)
{
	return function decorated()
	{
		if(!(this instanceof func)) {
			return new (func.bind.apply(func, arguments));
		}
	}
}

function defclass(base, proto)
{
	if(typeof base === "function") {
		return extendclass(base, proto);
	}

	var proto = base;
	var ctor = proto.constructor;

	ctor.prototype = proto;

	return implynew(ctor);
}

function extendclass(base, proto)
{
	var newproto = Object.create(base.prototype);
	var keys = Object.keys(proto);
	
	for(var i=0; i<keys.length; i++) {
		var key = keys[i];
		
		newproto[key] = proto[key];
	}
	
	return defclass(newproto);
}
