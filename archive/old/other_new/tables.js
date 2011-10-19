//var operators = ['!', '^', '*', '+', '(', ')', '='];

var precedence = [];
precedence["P"] = 4;	//permutation
precedence["S"] = 4;	//summation
precedence["C"] = 4;	//cosine
precedence["D"] = 4;	//arccos
precedence["!"] = 4;
precedence["^"] = 3;
precedence["s"] = 3;
precedence["*"] = 2;
precedence["/"] = 2;
precedence["+"] = 1;
precedence["-"] = 1;
precedence["="] = 0;

var arity = [];
//Arity is number of operators taken
arity["P"] = 2;
arity["S"] = 3;
arity["C"] = 1;
arity["!"] = 1;
arity["^"] = 2;
arity["*"] = 2;
arity["+"] = 2;
arity["="] = 2;

var assoc = [];  /*STILL TO FIGURE OUT....UNARY OPERATORS!!!*/
//0 is non-associative
//1 is left-associative
//2 is right-associative
//3 is complete-associative
assoc["P"] = 3;
assoc["S"] = 3;
assoc["C"] = 3;
assoc["!"] = 3;
assoc["^"] = 2;
assoc["*"] = 0;
assoc["+"] = 0;
assoc["="] = 0;

var inverses = [];
inverses["D"] = "C";
inverses["s"] = "^";
inverses["-"] = "+";
inverses["/"] = "*";

var inverse = [];
inverse["C"] = "D";
inverse["^"] = "s";
inverse["+"] = "-";
inverse["*"] = "/";

var place = [];	//Whether operator is pre, in, or post
//0 is pre
//1 is in
//2 is post
place["P"] = 1;
place["S"] = 0;
place["C"] = 0;
place["!"] = 2;
place["^"] = 1;
place["*"] = 1;
place["+"] = 1;
place["="] = 1;

var identity = []; //Operators that can serve as default must have an identity
identity["*"] = "1";
identity["+"] = "0";
