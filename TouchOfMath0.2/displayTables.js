//	Whether or not the operator and its parameters require unique display settings
var specialDisplayOperator = new Array();

specialDisplayOperator["P"] = true;
specialDisplayOperator["sum"] = true;
specialDisplayOperator["cos"] = true;
specialDisplayOperator["arccos"] = true;
specialDisplayOperator["!"] = false;
specialDisplayOperator["^"] = true;
specialDisplayOperator["rt"] = true;
specialDisplayOperator["*"] = false;
specialDisplayOperator["/"] = true;
specialDisplayOperator["+"] = false;
specialDisplayOperator["-"] = false;
specialDisplayOperator["="] = false;
specialDisplayOperator["parentheses"] = true;


//	What to display as the operator-literal
var operatorCharacters = new Array();

operatorCharacters["="] = "=";
operatorCharacters["*"] = "&sdot;";
operatorCharacters["/"] = "/";
operatorCharacters["+"] = "+";
operatorCharacters["-"] = "&minus;";
operatorCharacters["sum"] = "&sum;";
operatorCharacters["^"] = "^";


//	The string to use in a css classname coresponding to the operator
var operatorClassNameCharacters = new Array();

operatorClassNameCharacters["P"] = "P";
operatorClassNameCharacters["sum"] = "Sum";
operatorClassNameCharacters["cos"] = "Cos";
operatorClassNameCharacters["arccos"] = "Arccos";
operatorClassNameCharacters["!"] = "Factorial";
operatorClassNameCharacters["^"] = "Power";
operatorClassNameCharacters["rt"] = "Root";
operatorClassNameCharacters["*"] = "Multiplication";
operatorClassNameCharacters["/"] = "Division";
operatorClassNameCharacters["+"] = "Addition";
operatorClassNameCharacters["-"] = "Subtraction";
operatorClassNameCharacters["="] = "Equals";
operatorClassNameCharacters["parentheses"] = "Parentheses";