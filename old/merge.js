function startmerge(i1, i2)
{
	var a = blocks[i1].node;
	var b = blocks[i2].node;
	
	mergeeq(a,b);
	
	render_from_tree();
}

function mergeeq(node1, node2)
{
	var LCA = find_LCA(node1, node2);
	var arr = [];
	arr = evaluate(LCA, LCA.value);
	
	var highest_ok = 0;
	var temp;
	
	//Moves all non-evaluated terms to beginning of array
	for(var i=0; i<arr.length; i++)
	{
		if(isNaN(arr[i].value) && (arr[i].value[0] != '/' || isNaN(arr[i].value.slice(1,arr[i].value.length))))
		{
			temp = arr[highest_ok];
			arr[highest_ok++] = arr[i];
			arr[i] = temp;
		}
	}

	if(highest_ok < arr.length)
	{
		//Creates and solves eval string
		var str = arr[highest_ok].value;
		//if(str[0] == "/")
		//	str = "1" + str;
		
		if(LCA.value == '+' || LCA.value == '-')
		{
			for(var i=highest_ok+1; i<arr.length; i++)
			{
				if(arr[i].value[0] == "-")
					str = str + "-" + arr[i].value.slice(1,arr[i].value.length);
				else
					str = str + "+" + arr[i].value;
			}
		}
		
		else if(LCA.value == '*' || LCA.value == '/')
		{
			for(var i=highest_ok+1; i<arr.length; i++)
			{
				if(arr[i].value[0] == "/")
					str = str + "/" + arr[i].value.slice(1,arr[i].value.length);
				else
					str = str + "*" + arr[i].value;
			}
		}
			
		arr[highest_ok].value = (eval(str)).toString();
		arr.splice(highest_ok+1, arr.length-highest_ok);
	}
	
	//Returns a single value or reconstructs the tree
	if(arr.length == 1)
	{
		LCA.value = arr[highest_ok].value;
		delete_all(LCA.left);
		delete_all(LCA.right);
		LCA.left = LCA.right = null;
		return;
	}
	
	if(LCA.value == "+" || LCA.value == "-")
	{
		while(arr.length != 1)
		{
			var add = new node();
			add.value = "+";
			if(arr[0].value.length > 1 && arr[0].value[0] == '-')
			{
				add.left = new node();
				add.left.value = '-';
				add.left.left = new node();
				add.left.left.value= '0';
				add.left.left.par = add.left;
				add.left.right = arr[0];
				add.left.right.value = arr[0].value.slice(1,arr[0].value.length);
				add.left.right.par = add.left;
			}
			else
				add.left = arr[0];
			add.right = arr[1];
			if(add.right.value.length > 1 && add.right.value[0] == "-")
			{
				add.value = "-";
				add.right.value = add.right.value.slice(1,arr[1].value.length);
			}
			add.left.par = add.right.par = add;
			arr.splice(0,2);
			arr.unshift(add);
		}
	}
	
	else if(LCA.value == "*" || LCA.value == "/")
	{
		while(arr.length != 1)
		{
			var add = new node();
			add.value = "*";
			if(arr[0].value.length > 1 && arr[0].value[0] == '/')
			{
				add.left = new node();
				add.left.value = '/';
				add.left.left = new node();
				add.left.left.value= '1';
				add.left.left.par = add.left;
				add.left.right = arr[0];
				add.left.right.value = arr[0].value.slice(1,arr[0].value.length);
				add.left.right.par = add.left;
			}
			else
				add.left = arr[0];
			
			add.right = arr[1];
			if(add.right.value.length > 1 && add.right.value[0] == "/")
			{
				add.value = "/";
				add.right.value = add.right.value.slice(1,arr[1].value.length);
			}
			add.left.par = add.right.par = add;
			arr.splice(0,2);
			arr.unshift(add);
		}
	}
	
	arr[0].par = LCA.par;
	if(LCA.par.left == LCA)
		LCA.par.left = arr[0];
	else
		LCA.par.right = arr[0];
			
}

function evaluate(node, target_op)
//Makes recursive calls that utilize commutativity
//Fills the left and right subarrays with either unsolved values, operators, or 
//variables, and inverts the right side as necessary, returning a combined array
{
	var left = [], right = [];
	if(operators.indexOf(node.value) == -1)
	{
		left.push(node);
		return left;
	}
	
	if((node.value == '+' || node.value == '-') && (target_op == '+' || target_op == '-'))
	{
		if(node.left.value == "+" || node.left.value == "-" || operators.indexOf(node.left.value) < 0)
			left = evaluate(node.left, target_op);
		else
			left.push(node.left);
			
		if(node.right.value == "+" || node.right.value == "-" || operators.indexOf(node.right.value) < 0)
			right = evaluate(node.right, target_op);
		else
			right.push(node.right);
	
		if(node.value == "-")
			for(var i=0; i<right.length; i++)
			{
				if(right[i].value.length > 1 && right[i].value[0] == "-")
					right[i].value = right[i].value.slice(1, right[i].value.length);
				else
					right[i].value = "-"+ right[i].value;
			}
	}
	
	else if((node.value == '*' || node.value == '/') && (target_op == '*' || target_op == '/'))
	{
		if(node.left.value == "*" || node.left.value == "/" || operators.indexOf(node.left.value) < 0)
			left = evaluate(node.left, target_op);
		else
			left.push(node.left);
			
		if(node.right.value == "*" || node.right.value == "/" || operators.indexOf(node.right.value) < 0)
			right = evaluate(node.right, target_op);
		else
			right.push(node.right);
	
		if(node.value == "/")
			for(var i=0; i<right.length; i++)
			{
				if(right[i].value.length > 1 && right[i].value[0] == "/")
					right[i].value = right[i].value.slice(1, right[i].value.length);
				else
					right[i].value = "/"+ right[i].value;
			}
	}	
	else
		right.push(node);
		
	left=left.concat(right);
	
	return left;
}
				
function find_LCA(node1, node2)
{
	var temp1 = node1.par;
	var temp2 = node2.par;
	var arr = [];
	
	while(temp1.value != '=')
	{
		arr.push(temp1);
		temp1 = temp1.par;
	}
	
	while(arr.indexOf(temp2) == -1)
		temp2 = temp2.par;
		
	return temp2;
}
