//	Whether or not the operator and its parameters require unique display settings
var specialDisplayOperator =
{
    "P": true,
    "sum": true,
    "cos": true,
    "arccos": true,
    "!": false,
    "^": true,
    "rt": true,
    "*": false,
    "/": true,
    "+": false,
    "-": false,
    "=": false,
    "parentheses": true
};

//	What to display as the operator-literal
var operatorCharacters =
{
    "=": "=",
    "*": "&sdot;",
    "/": "/",
    "+": "+",
    "-": "&minus;",
    "sum": "&sum;",
    "^": "^"
};

//	The string to use in a css classname coresponding to the operator
var operatorClassNameCharacters =
{
    "P": "P",
    "sum": "Sum",
    "cos": "Cos",
    "arccos": "Arccos",
    "!": "Factorial",
    "^": "Power",
    "rt": "Root",
    "*": "Multiplication",
    "/": "Division",
    "+": "Addition",
    "-": "Subtraction",
    "=": "Equals",
    "parentheses": "Parentheses"
};
