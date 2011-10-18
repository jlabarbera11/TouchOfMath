function stoa(untreated)
{
	untreated = untreated
			.replace(/\s/g, "") 				//whitespace
			.replace(/(\d{1,})/g, "|$1|") 		//digit
			.replace(/\(/g, "|(|") 				//left parentheses
			.replace(/\)/g, "|)|") 				//right parentheses
			.replace(/,/g, "|,|") 				//comma
			
			.replace(/P/g, "|P|") 				//permutation
			.replace(/sum/g, "|sum|") 			//summation
			.replace(/summation/g, "|sum|")
			.replace(/cosine/g, "|cos|") 		//cosine
			.replace(/cos/g, "|cos|")
			.replace(/arccosine/g, "|arccos|") 	//arccosine
			.replace(/arccos/g, "|arccos|")
			.replace(/!/g, "|!|")				//factorial
			.replace(/\^/g, "|^|")				//exponent
			.replace(/rt/g, "|rt|") 			//root
			.replace(/root/g, "|rt|")
			.replace(/\*/g, "|*|") 				//multiplication
			.replace(/(\/)/g, "|/|") 			//division
			.replace(/\+/g, "|+|") 				//addition
			.replace(/-/g, "|-|") 				//subtraction
			.replace(/=/g, "|=|") 				//equals
			;

	untreated = untreated.split("|");
	for(var i=0; i<untreated.length; i++)
		if(untreated[i] == "")
			untreated.splice(i,1);
			
	for(var i=0; i<untreated.length; i++)
		if(untreated[i] == "-" && (i==0 || precedence[untreated[i-1]] != undefined || special[untreated[i-1]] != undefined))
		{
			untreated[i+1] = "-" + untreated[i+1];
			untreated.splice(i,1);
		}

	return untreated;
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
