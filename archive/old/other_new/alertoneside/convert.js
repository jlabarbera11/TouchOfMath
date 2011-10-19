function block(treenode)
{
	this.x = null;
	this.y = null;
	this.width = null;
	this.height = null;
	this.node = treenode;
	
	if(treenode != undefined)
		this.value = treenode.value;
}

function infix_to_postfix(input)
//takes a string input and returns an array in postfix form
//Does not invert characters
{
	var output = [];
	var opstack = [];

	for(var i=0; i<input.length; i++)
	{
		if(input[i] == " ")
			continue;
        else if(input[i] == '(')
        {
        	output.push(input[i]);
            opstack.push(input[i]);
        }
		else if(input[i] == ')' || input[i] == ',')
		{
			while(opstack[opstack.length-1] != '(')
			{
				output.push(opstack[opstack.length-1]);
				opstack.pop();
			}
			if(input[i] == ')')	
				opstack.pop();
			output.push(input[i]);
		}
		else if(precedence[input[i]] == undefined)
			output.push(input[i]);
		else
		{
			//This is where associativity matters. Right associativity should
			//pop everything, including the same operator, where left associativity
			//or no associtivity will not.
			if(assoc[input[i]] == 2 || place[input[i]] == 0) //Right associative
				while(opstack.length && precedence[opstack[opstack.length-1]] > precedence[input[i]])
				{
					output.push(opstack[opstack.length-1]);
					opstack.pop();
				}
			else
				while(opstack.length && precedence[opstack[opstack.length-1]] >= precedence[input[i]])
				{
					output.push(opstack[opstack.length-1]);
					opstack.pop();
				}
			opstack.push(input[i]);
		}
	}

	while(opstack.length)
	{
		output.push(opstack[opstack.length-1]);
		opstack.pop();
	}

	return output;
}
