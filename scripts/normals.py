#!/usr/bin/env python3

from sympy import *
from sympy.abc import *

cross = lambda a, b: [
	a[1]*b[2] - a[2]*b[1],
	a[2]*b[0] - a[0]*b[2],
	a[0]*b[1] - a[1]*b[0],
]

sub = lambda a, b: [
	a[0] - b[0],
	a[1] - b[1],
	a[2] - b[2],
]

sqlength = lambda a: a[0]**2 + a[1]**2 + a[2]**2

length = lambda a: sqrt(sqlength(a))

normalize = lambda a: [
	a[0] / length(a),
	a[1] / length(a),
	a[2] / length(a),
]

dot = lambda a, b: a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

def rotateX(v, a):
	sina = sin(a)
	cosa = cos(a)
	return [
		v[0],
		v[1]*cosa - v[2]*sina,
		v[2]*cosa + v[1]*sina,
	]

def rotateY(v, a):
	sina = sin(a)
	cosa = cos(a)
	return [
		v[0]*cosa + v[2]*sina,
		v[1],
		v[2]*cosa - v[0]*sina,
	]

def rotateZ(v, a):
	sina = sin(a)
	cosa = cos(a)
	return [
		v[0]*cosa - v[1]*sina,
		v[1]*cosa + v[0]*sina,
		v[2],
	]

def vecadd(*vecs):

	res = [0, 0, 0]
	
	for vec in vecs:
		res = [
			res[0] + vec[0],
			res[1] + vec[1],
			res[2] + vec[2],
		]
	
	return res

vecneg = lambda v: [-v[0], -v[1], -v[2]]

vecsimplify = lambda v: [
	simplify(v[0]),
	simplify(v[1]),
	simplify(v[2]),
]

def printvec(v):
	print("_")
	print(v[0])
	print(v[1])
	print(v[2])
	print("-")

t = sqrt(3) / 2

Pz, Az, Bz, Cz, Dz, Ez, Fz = symbols("Pz, Az, Bz, Cz, Dz, Ez, Fz")

PA = [-1,   0,  Az - Pz]
PB = [-0.5, -t, Bz - Pz]
PC = [+0.5, -t, Cz - Pz]
PD = [+1,   0,  Dz - Pz]
PE = [+0.5, +t, Ez - Pz]
PF = [-0.5, +t, Fz - Pz]

PAxPB = cross(PA, PB)
PBxPC = cross(PB, PC)
PCxPD = cross(PC, PD)
PDxPE = cross(PD, PE)
PExPF = cross(PE, PF)
PFxPA = cross(PF, PA)

vsum = vecadd(PAxPB, PBxPC, PCxPD, PDxPE, PExPF, PFxPA)
normal = normalize(vsum)

sun = rotateZ(rotateX([0, 0, -1], rad(-45)), rad(30))

coef = dot(vecneg(sun), normal)

print(coef)
print()
print(simplify(coef))

