var tree;
var prevtrees = [];

function node()
{
	this.value = null;
	this.children = [];
	this.par = null;
	this.inverted = 0;
	this.index;
}

function mathTree()
{
	this.root = new node();
	this.buildTree = function(arr) {add(this.root, arr, arr.length-1, 0);
									assignIndices(this.root, 0); 
									return printtree(this.root, 0, 0)};
	this.buildTreeFromNode = function(node) {this.root = node};
	this.update = function() {assignIndices(this.root, 0); return printtree(this.root, 0, 0)};
	this.getMoving = function(root, l, t) {return printtree(root, l, t)};
	this.subtree = function(node) {return subtree(node)};
}

function add(root, arr, curr, lev)
{
	if(curr < 0)
		return;
	var level = lev;	
	
	var temp = curr;
	while(arr[temp+1] == ")")
		temp++;
	if(temp+1 < arr.length && isNaN(arr[temp+1]) && inverses[arr[temp+1]] != undefined)
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
		else if((arr[curr]==root.value || arr[curr] == inverse[root.value]) && assoc[root.value]!=3 && lev==level)
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

function printtree(node, l, offset)
//Returns an array of blocks with inverted operators
{
	var xmlfeed = "";
	
	//beginning parentheses
	if(node.par && precedence[node.value] <= precedence[node.par.value] && l==0)
		xmlfeed = xmlfeed.concat("<operator type=\"parentheses\">\n");
		
	if(precedence[node.value] == undefined)
		return "<parameter type=\"" + node.value + "\" index=\"" + node.index*100 + "\"/>\n";
	
	var opp = false;
	for(var i=l; i<l+arity[node.value]; i++)
	{
		if(i == l && arity[node.value] > 1)
			continue;
		if(node.children[i].inverted)
			opp = true;
	}
	
	if(!opp)
		xmlfeed = xmlfeed.concat("<operator type=\"" + node.value + "\" index=\"" + (node.index*100+offset) + "\">\n");
	else
		xmlfeed = xmlfeed.concat("<operator type=\"" + inverse[node.value] + "\" index=\"" + (node.index*100+offset) + "\">\n");
	
	for(var i=l; i<l+arity[node.value]-1; i++)	
		xmlfeed = xmlfeed.concat(printtree(node.children[i], 0, 0));
	if(l + arity[node.value] == node.children.length)
		xmlfeed = xmlfeed.concat(printtree(node.children[node.children.length-1], 0, 0));
	else
		xmlfeed = xmlfeed.concat(printtree(node, l+1, offset+1));
	xmlfeed = xmlfeed.concat("</operator>\n");
	
	//ending parentheses
	if(node.par && precedence[node.value] <= precedence[node.par.value] && l==0)
		xmlfeed = xmlfeed.concat("</operator>\n");
	
	return xmlfeed;
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

function assignIndices(root, num)
{
	root.index = num++;
	for(var i=0; i<root.children.length; i++)
		num = assignIndices(root.children[i], num);
	return num;
}
