var precedence = [];
precedence["P"] = 4;		//permutation
precedence["sum"] = 4;		//summation
precedence["cos"] = 4;		//cosine
precedence["arccos"] = 4;	//arccos
precedence["!"] = 4;
precedence["^"] = 3;
precedence["rt"] = 3;
precedence["*"] = 2;
precedence["/"] = 2;
precedence["+"] = 1;
precedence["-"] = 1;
precedence["="] = 0;

var special = [];
special["("] = 1;
special[")"] = 1;
special[","] = 1;

//Arity is number of operators taken
var arity = [];
arity["P"] = 2;
arity["sum"] = 3;
arity["cos"] = 1;
arity["!"] = 1;
arity["^"] = 2;
arity["*"] = 2;
arity["+"] = 2;
arity["="] = 2;

//0 is non-associative
//1 is left-associative
//2 is right-associative
//3 is complete-associative
var assoc = [];
assoc["P"] = 3;
assoc["sum"] = 3;
assoc["cos"] = 3;
assoc["!"] = 3;
assoc["^"] = 2;
assoc["*"] = 0;
assoc["+"] = 0;
assoc["="] = 0;

var inverses = [];
inverses["arccos"] = "cos";
inverses["rt"] = "^";
inverses["-"] = "+";
inverses["/"] = "*";

var inverse = [];
inverse["cos"] = "arccos";
inverse["^"] = "rt";
inverse["+"] = "-";
inverse["*"] = "/";

//0 is pre, 1 is in, 2 is post
var place = [];
place["P"] = 1;
place["sum"] = 0;
place["cos"] = 0;
place["!"] = 2;
place["^"] = 1;
place["*"] = 1;
place["/"] = 1;
place["+"] = 1;
place["-"] = 1;
place["="] = 1;

//Operators that can serve as default must have an identity
var identity = [];
identity["*"] = "1";
identity["+"] = "0";

var symbols = [];
symbols["sigma"] = 1
symbols["pi"] = 1
symbols["epsilon"] = 1

var constants = [];
constants["e"] = 1;
constants["$pi"] = 1;
