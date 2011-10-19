//point to nodes on the tree
var targetm = [];
var targeta = [];
var target = [];

var destination;
var destinationa;
var destinationm;

var presplintered = [];
var touchcount = 0;

//on first call, n should equal root
function findnodebyindex(n, index)
{
	if(n.index == index)
		return n;
	for(var i=0; i<n.children.length; i++)
	{
		var a = findnodebyindex(n.children[i], index);
		if(a != null)
			return a;
	}
}

function save_next(root)
{
	var n = new node();
	n.value = root.value;
	n.inverted = root.inverted;
	n.index = root.index;
	
	for(var i=0; i<root.children.length; i++)
	{
		n.children.push(save_next(root.children[i]));
		n.children[n.children.length-1].par = n;
	}
	return n;
}

function save_prev()
{
	var node = save_next(tree.root);
	var oldTree = new mathTree();
	oldTree.buildTreeFromNode(node);
	prevtrees.push(oldTree);
}

//dfs to find the node whose index matches the one clicked
function findb(root, index)
{
	if(root.index == index)
		return root;
	for(var i=0; i<root.children.length; i++)
	{
		var child = findb(root.children[i], index);
		if(child != null)
			return child;
	}
}

function finda(root, b)
{
	var a = b;
	while(a && a.par != root)
		a = a.par;
		
	return a;
}

function findm(b,a)
{
	var m;
	if(b != a && inverse[a.value] != undefined && arity[a.value] != 1 && assoc[a.value] == 0)
	{
		m = b;
		while(m && m.par != a)
			m = m.par;
	}
	else
		m = a;

	return m;
}

//Assigns target, targetm, and targeta
//t is index of clicked term
//l is index of term immediately left, not including parentheses
//r is index of term immediately right
function down(idx)
{
	if(document.getElementById("final").innerHTML.length)
		document.getElementById("initial").innerHTML = document.getElementById("final").innerHTML;
	touchcount++;
	
	var t = Math.floor(idx/100);
	var lshift = idx%100;
	if(findnodebyindex(tree.root, t) == tree.root)
		return;
		
	save_prev();
	
	target[t] = findb(tree.root, t);
	targeta[t] = finda(tree.root, target[t]);
	targetm[t] = findm(target[t], targeta[t]);
	
	if(targeta[t] != targetm[t])
		 lshift = 0;
	
	if(targetm[t]==targeta[t] && targetm[t].children.length>arity[targetm[t].value] && inverse[targetm[t].value]!=undefined && place[targetm[t].value]==1)
		pre_splinter(t, lshift);
	
	//will eventually be
	//return tree.getMoving(targetm[t], 0, lshift);
	var xmlstring = tree.getMoving(targetm[t], 0, lshift);
	document.getElementById("log").innerHTML += ("moving :<br/>" + sanitize(xmlstring).replace(/\n/g, "<br />") + "<br/>");
	return xmlstring;
}

function pre_splinter(t, lshift)
{
	if(assoc[targeta[t].value] == 0)
	{
		var n = new node;
		n.value = targeta[t].value;
		n.index = targeta[t].index;
		
		n.children.unshift(target[t].children[lshift+1]);
		n.children[0].par = n;
		n.children.unshift(target[t].children[lshift]);
		n.children[0].par = n;
		
		targeta[t].children.splice(targeta[t].children.indexOf(n.children[0]),2,n);
		n.par = targeta[t];
		
		targetm[t] = n;
		presplintered[t] = 2;
	}
	
	/*else if(assoc[targeta[t].value] == 1 && 
			targeta[t].children.indexOf(finda(targeta[t], findnodebyindex(tree.root, l))) != targeta[t].children.length-1)
	{
		var n = new node();
		n.value = targeta[t].value;
		n.par = targeta[t];
		
		n.children = targeta[t].children.splice(0,targeta[t].children.length-1,n);
		for(var i=0; i<n.children.length; i++)
			n.children[i].par = n;
			
		targetm[t] = n;
		presplintered[t] = 1;
	}*/
		
	else if(assoc[targeta[t].value] == 2 && 
				(targeta[t].children.indexOf(finda(targeta[t], target[t])) > 0 || 
				targeta[t].children.indexOf(finda(targeta[t], targetm[t].children[lshift])) > 0
				)
			)
	{
		var n = new node();
		n.value = targeta[t].value;
		n.par = targeta[t];
		
		n.children = targeta[t].children.splice(1,targeta[t].children.length-1,n);
		for(var i=0; i<n.children.length; i++)
			n.children[i].par = n;
			
		targetm[t] = n;
		presplintered[t] = 1;
	}
}

//When a click is released, this function will determine
//what tree manipulations need to happen
function up(idx, des)
{
	var t = Math.floor(idx/100);
	var d = Math.floor(des/100);
	
	if(touchcount == 0)
	{
		document.getElementById("log").innerHTML += "Invalid up<br/>";
		return;
	}
	
	var changed = 0;
	if(findnodebyindex(tree.root, d) != findnodebyindex(tree.root,t) && findnodebyindex(tree.root, d) != tree.root)
	{
		destination = findb(tree.root, d);
		destinationa = finda(tree.root, destination);
		destinationm = findm(destination, destinationa);
	
		if(tree.root.value == "=" && targeta[t] != destinationa)
			changed += traverse(t);
		if(touchcount > 1)
			changed += merge();
		changed += combine(t);
		changed += commute(t, d);
	}
	if(changed == 0)
		tree = prevtrees.pop();
			
	clean(tree.root);
	target = [];
	targeta = [];
	targetm = [];
	touchcount = 0;
	presplintered = [];
	
	//will eventually be
	//return tree.update();
	var xmlstring = tree.update();
	document.getElementById("final").innerHTML = sanitize(xmlstring).replace(/\n/g, "<br />");
	return xmlstring;
}

//When the target node is an targeta, a node must be created above it
function post_splinter(t)
{
	var n = new node();
	n.value = "+";
	
	var index = targeta[t].par.children.indexOf(targeta[t]);
	
	targeta[t].par.children[index] = n;
	n.par = targetm[t].par;

	n.children.push(new node());
	n.children[0].value = "0";
	n.children[0].par = n;
	
	n.children.push(targetm[t]);
	n.children[1].par = n;
	
	targeta[t] = targetm[t].par;
	
	presplintered[t] = 2;
}

//When an object is moved to the other side of an equals sign, this function is called
//Only updates the tree, not blocks
function traverse(t)
{

	if(target[t] == targeta[t] && arity[targetm[t].value] == 1 && inverse[targetm[t].value] != undefined)
	{
		//ex: cos(x) = y -> x = arccos(y)
		var index = targeta[t].par.children.indexOf(targeta[t]);
		var inverted = targetm[t].children[0].inverted;
		targetm[t].par.children[index] = targetm[t].children[0];
		targetm[t].children[0].par = targetm[t].par;
		
		for(var i=0; i<targetm[t].par.children.length; i++)
		{
			if(i == index)
			{
				targetm[t].par.children[i].inverted = 0;
				continue;
			}
			
			var n = new node();
			n.value = targetm[t].value;
			n.children.push(targetm[t].par.children[i])
			n.children[n.children.length-1].par = n;
			n.children[n.children.length-1].inverted = 1 - inverted;
			
			targetm[t].par.children[i] = n;
			n.par = targetm[t].par;
		}
		return 1;
	}
	
	else if(targetm[t] == targeta[t])
		post_splinter(t);
		
	var index = targeta[t].par.children.indexOf(targeta[t]);
	for(var i=0; i<targeta[t].par.children.length; i++)
	{
		if(i == index)
			continue;
		
		var n;
		if(targeta[t].value != targeta[t].par.children[i].value)
		{
			n = new node();
			n.value = targeta[t].value;
			
			n.children.push(targeta[t].par.children[i]);
			n.children[n.children.length-1].par = n;
			
			targeta[t].par.children[i] = n;
			n.par = targeta[t].par;
		}
		
		n = targeta[t].par.children[i];
		if(n.value==targeta[t].value && (presplintered[t]==2 || precedence[targetm[t].value]==null))
		{
			if(targetm[t].value != targeta[t].value)
			{
				n.children.push(tree.subtree(targetm[t]));
				n.children[n.children.length-1].par = n;
				n.children[n.children.length-1].inverted = 1 - n.children[n.children.length-1].inverted;
			}
				
			else
				for(var j=0; j<targetm[t].children.length; j++)
				{
					n.children.push(targetm[t].children[j]);
					targetm[t].children[j].par = n;
					n.children[n.children.length-1].inverted = 1 - n.children[n.children.length-1].inverted;
				}
		}
		
		else
		{		
			n.children.push(tree.subtree(targetm[t]));
			n.children[1].par = n;
			n.children[1].inverted = 1 - n.children[1].inverted;
		
		}
	}
	
	targeta[t].children.splice(targetm[t].par.children.indexOf(targetm[t]), 1);
	if(targeta[t].children[0].inverted)
	{
		var n = new node();
		n.value = identity[targeta[t].value];
		targeta[t].children.unshift(n);
		n.par = targeta[t];
	}
	if(targeta[t].children.length == 1)
	{
		targeta[t].par.children[index] = targeta[t].children[0];
		targeta[t].children[0].par = targeta[t].par;
		targeta[t] = targeta[t].children[0];
	}
		
	return 1;
}

function merge()
{
	return 0;
}

function combine(t)
{
	if(!isNaN(targetm[t].value) && !isNaN(destinationm.value) && targeta[t] == destinationa && assoc[targeta[t].value] == 0)
	{
		if(targetm[t].inverted)
			destinationm.inverted = 1- destinationm.inverted;
		if(destinationm.inverted)
			destinationm.value = evaluate(inverse[destinationa.value], parseFloat(targetm[t].value), parseFloat(destinationm.value)).toString();
		else
			destinationm.value = evaluate(destinationa.value, parseFloat(targetm[t].value), parseFloat(destinationm.value)).toString();
		destinationm.inverted = targetm[t].inverted;
		
		targetm[t].value = identity[targeta[t].value];
		if(targeta[t].children[0].inverted)
		{
			targeta[t].children.unshift(new node());
			targeta[t].children[0].value = identity[targeta[t].value];
			targeta[t].children[0].par = targeta[t];
		}
		return 1;
	}
	
	return 0;
}

function commute(t,d)
{
	return 0;
}

function clean(n)
{
	if(n.par && n.value==identity[n.par.value] && n.par.children.length > 1)
	{
		n.par.children.splice(n.par.children.indexOf(n), 1);
		return 1;
	}
	var i=0;
	while(i<n.children.length)
	{
		i -= clean(n.children[i]);
		i++;
	}
	
	if(n.children.length == 0)
		return 0;	
	if(n.children[0].inverted && inverse[n.value])
	{
			var nn = new node();
			n.children.unshift(nn);
			nn.par = n;
			nn.value = identity[n.value];
			n.children[0].inverted = 0;
	}
	if(n.children.length < arity[n.value])
	{
		n.par.children[n.par.children.indexOf(n)] = n.children[0];
		n.children[0].par = n.par;
	}
	return 0;
}

function evaluate(op, a, b)
{
	switch(op)
	{
		case '+':
			return a+b;
		case '-':
			return a-b;
		case '*':
			return a*b;
		case '/':
			return a/b;
	}
}

function undo()
{
	if(prevtrees.length == 0)
		return;
	tree = prevtrees.pop();
	
	//will eventually be
	//return tree.update();
	var xmlstring = tree.update();
	document.getElementById("final").innerHTML = sanitize(xmlstring).replace(/\n/g, "<br />");
	return xmlstring;
}

