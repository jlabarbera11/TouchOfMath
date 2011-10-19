function node()
{
	this.value = null;
	this.children = [];
	this.par = null;
	this.inverted = 0;
}

function mathTree()
{
	this.root = new node();
	this.buildTree = function(arr) { add(this.root, arr, arr.length-1, 0) };
	this.printTree = function() {return printtree(this.root)};
	this.printSubtree = function(node) {return printtree(node)};
}

function add(root, arr, curr, lev)
{
	if(curr < 0)
		return;
	var level = lev;	
	
	if(curr+1 < arr.length && isNaN(arr[curr+1]) && inverses[arr[curr+1]] != undefined)
		root.inverted = 1 - root.inverted;
	root.value = arr[curr--];
	if(inverses[root.value] != undefined)
		root.value = inverses[root.value];
	
	if(precedence[root.value] == undefined)
		return curr;
	
	var i=1;
	while(i<=arity[root.value])
	{
		if(arr[curr] == ")")
		{
			lev++;
			curr--;
		}
		else if(arr[curr] == "(")
		{
			lev--;
			curr--;
		}
		else if(arr[curr] == ',')
			curr--;
		else if(arr[curr]==root.value && assoc[root.value]!=3 && lev==level)
		{
			i-=(arity[root.value]-1);
			curr--;
		}
			
		else
		{
			root.children.unshift(new node());
			curr=add(root.children[0], arr, curr, lev);
			root.children[0].par = root;
		
			i++;
		}
	}
	return curr;
}

function printtree(node)
//Returns an array of blocks with inverted operators
{
	var blocks=[];
	
	if(node.par && precedence[node.value] <= precedence[node.par.value])
	{
		var left = new block(null);
		left.value = "(";
		blocks = blocks.concat(left);
	}
		
	if(place[node.value] == 0)	//Operator is pre
	{
		var op = new block(node);
		if(node.children[node.children.length-1].inverted)
			op.value = inverse[node.value];
		blocks = blocks.concat(op);
		
		if(arity[node.value] > 1)
		{
			var leftop = new block(null);
			leftop.value = "(";
			blocks = blocks.concat(leftop);
		}
		
		blocks = blocks.concat(printtree(node.children[0]));
		for(var i=1; i<node.children.length; i++)
		{
			var a = new block(null);
			a.value = ",";
			blocks = blocks.concat(a);
			blocks = blocks.concat(printtree(node.children[i]));
		}
		
		if(arity[node.value] > 1)
		{
			var rightop = new block(null);
			rightop.value = ")";
			blocks = blocks.concat(rightop);
		}
	}
	
	else if(place[node.value] == 1)	//Operator is middle
	{	
		blocks = blocks.concat(printtree(node.children[0]));
		for(var i=1; i<node.children.length; i++)
		{
			var b = new block(node);
			if(node.children[i].inverted)
				b.value = inverse[node.value];
			blocks = blocks.concat(b);
			blocks = blocks.concat(printtree(node.children[i]));
		}
	}
	
	else if(place[node.value] == 2)	//Operator is post
	{	
		blocks = blocks.concat(printtree(node.children[0]));
		for(var i=1; i<node.children.length; i++)
		{
			var a = new block(null);
			a.value = ",";
			blocks = blocks.concat(a);
			blocks = blocks.concat(printtree(node.children[i]));
		}
		
		var op = new block(node);
		if(node.children[node.children.length-1].inverted)
			op.value = inverse[node.value];
		blocks = blocks.concat(op);
	}
	
	else
	{
		var b = new block(node);
		blocks = blocks.concat(b);
	}	
	
	if(node.par && precedence[node.value] <= precedence[node.par.value])
	{
		var right = new block(null);
		right.value = ")";
		blocks = blocks.concat(right);
	}
	
	return blocks;
}

function subtree(root)
{
	var n = new node();
	n.value = root.value;
	n.inverted = root.inverted;
	
	for(var i=0; i<root.children.length; i++)
	{
		n.children.push(subtree(root.children[i]));
		n.children[n.children.length-1].par = n;
	}
	
	return n;
}

