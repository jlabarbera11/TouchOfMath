//point to nodes on the tree
var targetm;
var targeta;
var target;

var destination;
var destinationa;
var destinationm;

function save_next(root)
{
	var n = new node();
	n.value = root.value;
	n.par = root.par;
	n.inverted = root.inverted;
	n.index = root.index;
	
	for(var i=0; i<root.children.length; i++)
		n.children.push(save_next(root.children[i]));
		
	return n;
}

function save_prev(root)
{
	var node = save_next(root);
	var oldTree = new mathTree();
	oldTree.buildTreeFromNode(node);
	prevtrees.push(oldTree);
}

function findb(root, index)
//dfs to find the node whose index matches the one clicked
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

function finda(b)
{
	var a = b;
	while(a.par.par)
		a = a.par;
		
	return a;
}

function findm(b,a)
{
	var m;
	if(b != a && inverse[a.value] != undefined && arity[a.value] != 1 && assoc[a.value] == 0)
	{
		m = b;
		while(m.par != a)
			m = m.par;
	}
	else
		m = a;

	return m;
}

function down(clicked)
//Assigns target, targetm, and targeta
//Clicked is the block that has been targeted
{
	target = findb(tree.root, clicked);
	targeta = finda(target);
	targetm = findm(target, targeta);
	
	if(targetm==targeta && targetm.children.length>arity[targetm.value] && inverse[targetm.value]!=undefined && place[targetm.value]==1)
		pre_splinter(clicked);
		
	moving_nodes = tree.printSubtree(targetm);
}

function pre_splinter(clicked)
{
	var index = blocks.indexOf(clicked);
	if(assoc[targeta.value] == 0)
	{
		var n = new node;
		n.value = targeta.value;
		
		n.children.unshift(blocks[index+1].node);
		n.children[0].par = n;
		n.children.unshift(blocks[index-1].node);
		n.children[0].par = n;
		
		targeta.children.splice(targeta.children.indexOf(blocks[index-1].node),2,n);
		n.par = targeta;
		
		targetm = n;
	}
	
	else if(assoc[targeta.value] == 1 && targeta.children.indexOf(blocks[index-1].node) != targeta.chilren.length-1)
	{
		var n = new node();
		n.value = targeta.value;
		n.par = targeta;
		
		n.children = targeta.children.splice(0,targeta.children.length-1,n);
		for(var i=0; i<n.children.length; i++)
			n.children[i].par = n;
			
		targetm = n;
	}
	
	else if(assoc[targeta.value] == 2 && targeta.children.indexOf(blocks[index-1].node) != 0)
	{
		var n = new node();
		n.value = targeta.value;
		n.par = targeta;
		
		n.children = targeta.children.splice(1,targeta.children.length-1,n);
		for(var i=0; i<n.children.length; i++)
			n.children[i].par = n;
			
		targetm = n;
	}
}

function up(num)
//When a block is released, this function will determine
//what tree manipulations need to happen
//Will update the blocks array as necessary
{
	destination = findb(tree.root, num);
	destinationa = finda(destination);
	destinationm = findm(destination, destinationa);
	
	if(targeta != destinationa)
	{
		save_prev(tree.root);
		traverse();
	}
	
	tree.reassignIndices();
	tree.printTree();
	
	printtodoc();
}

function post_splinter()
//When the target node is an targeta, a node must be created above it
{
	var n = new node();
	n.value = defop;
	
	var index = targeta.par.children.indexOf(targeta);
	
	targeta.par.children[index] = n;
	n.par = targetm.par;

	n.children.push(new node());
	n.children[0].value = identity[defop];
	n.children[0].par = n;
	
	n.children.push(targetm);
	n.children[1].par = n;
	
	targeta = targetm.par;
}


function printtodoc()
{
    xmlstring = tree.printTree();
	xmlstring = escapeHTML(xmlstring);
	xmlstring = nl2br_js(xmlstring);
	document.getElementById("final").innerHTML = "Final:<br/\>" + xmlstring;
}
