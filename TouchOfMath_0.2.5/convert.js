
function remove_nested_brackets(untreated) {
	var treated = "";
	for(var i=0; i<untreated.length; i++) {
		if(untreated[i] == "[") {
			var open = 1;
			sub = "[";
			while(open) {
				i++;
				if(untreated[i] == "[")
					open+=1;
				else if(untreated[i] == "]")
					open-=1;
				else sub = sub.concat(untreated[i]);
			}
			treated = treated.concat(sub, ']');
		}
		else treated = treated.concat(untreated[i]);
	}

	return treated;
}
//takes a string, returns an array parsed by variables and operators
function first_parse(untreated)
{
	untreated = untreated
		.replace(/\s/g, "") 				//whitespace
		.replace(/\(/g, "[(]") 				//left parentheses
		.replace(/\)/g, "[)]") 				//right parentheses
		.replace(/,/g, "[,]") 				//comma
		
		.replace(/P/g, "[P]") 				//permutation
		.replace(/summation/g, "[sum]")		//summation
		.replace(/sum/g, "[sum]")
		.replace(/arccosine/g, "[arccos]") 	//arccosine
		.replace(/arccos/g, "[arccos]")
		.replace(/cosine/g, "[cos]") 		//cosine
		.replace(/cos/g, "[cos]")
		.replace(/!/g, "[!]")				//factorial
		.replace(/\^/g, "[^]")				//exponent
		.replace(/rt/g, "[rt]") 			//root
		.replace(/root/g, "[rt]")
		.replace(/\*/g, "[*]") 				//multiplication
		.replace(/(\/)/g, "[/]") 			//division
		.replace(/\+/g, "[+]") 				//addition
		.replace(/-/g, "[-]") 				//subtraction
		.replace(/=/g, "[=]") 				//equals
		;

	untreated = remove_nested_brackets(untreated);
	untreated = untreated.split(/[\[\]]/);

	for(var i=0; i<untreated.length; i++)
		if(untreated[i] == "")
			untreated.splice(i,1);			
	for(var i=0; i<untreated.length; i++)
		if(untreated[i] == "-" && (i==0 || precedence[untreated[i-1]] != undefined || untreated[i-1] == ','))
		{
			untreated[i+1] = "-" + untreated[i+1];
			untreated.splice(i,1);
		}

	return untreated;
}

//takes a string, returns an array parsed of digits, symbols, constants, and variables
function second_parse(untreated)
{
	untreated = untreated
		.replace(/(".*?")/g, "[$1]")		//quoted variable
		.replace(/(\d{1,})/g, "[$1]")		//digit
		.replace(/epsilon/g, "[epsilon]")	//symbols
		.replace(/sigma/g, "[sigma]")		
		.replace(/pi/g, "[pi]")
		.replace(/e/g, "[e]")				//constants
		.replace(/([^\[\]])/g, "[$1]");		//everything else

	untreated = remove_nested_brackets(untreated);
	untreated = untreated.split(/[\[\]]/);

	for(var i=0; i<untreated.length; i++)
		if(untreated[i] == "")
			untreated.splice(i,1);

	return untreated;
}

function parse_input(untreated)
{
	untreated = untreated.replace(/\[/, "(").replace(/\]/, ")");
	untreated = first_parse(untreated);

	parsed = [];
	for(var i=0; i<untreated.length; i++) {
		var elements = second_parse(untreated[i]);
		for(var j=0; j<elements.length; j++) {
			if(symbols[elements[j]] != undefined)
				elements[j] = '&'.concat(elements[j]);
			if(constants[elements[j]] != undefined)
				elements[j] = '*'.concat(elements[j]);
			if(j != 0)
				parsed = parsed.concat(['*']);
			parsed = parsed.concat([elements[j].replace(/"/g, '')]);
		}
	}

	return infix_to_postfix(parsed);
}

//takes an array in and returns an array in postfix form
//Does not invert characters
function infix_to_postfix(input)
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
