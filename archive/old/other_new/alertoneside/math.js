//point to nodes on the tree
var targetm = [];
var targeta = [];
var target = [];
var destination = [];
var destinationm = [];
var destinationa = [];

var touchqueue = [];

function findb(clicked) //target, destination
{
	var index = blocks.indexOf(clicked);
	while(clicked.value == "(")
		clicked = blocks[++index];
	while(clicked.value == ")")
		clicked = blocks[--index];
	var b = clicked.node;
	
	return b;
}

function finda(b) //ancestor
{
	var a = b;
	while(a.par.par)
		a = a.par;
		
	return a;
}

function findm(b,a) //moving
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

function save_prev()
{
	var prevblocks = tree.printTree();
	var string = "";
	for(var i=0; i<prevblocks.length; i++)
		string = string.concat(prevblocks[i].value);
		
	string = infix_to_postfix(string);
	
	var prevtree = new mathTree();
	prevtree.buildTree(string);
	
	prevtrees.push(prevtree);
}

function down(src)
//Assigns target, targetm, and targeta
//Clicked is the block that has been targeted
{
	save_prev();
	
	target = findb(blocks[src]);
	targeta = finda(target);
	targetm = findm(target, targeta);
	
	if(targetm==targeta && targetm.children.length>arity[targetm.value] && inverse[targetm.value]!=undefined && place[targetm.value]==1)
		pre_splinter(clicked);
		
	moving_blocks = tree.printSubtree(targetm);
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

function up(src, dest)
//When a block is released, this function will determine
//what tree manipulations need to happen
//Will update the blocks array as necessary
{
	//Figures out what the movement did
	//For now, everything is assumed to be a traverse
		
	destination = findb(blocks[dest]);
	destinationa = finda(destination);
	destinationm = findm(destination, destinationa);
	
	if(targeta != destinationa)
		traverse();
	
	blocks = tree.printTree();
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

function traverse()
//When an object is moved to the other side of an equals sign, this function is called
//Only updates the tree, not blocks
{

	if(target == targeta && arity[targetm.value] == 1 && inverse[targetm.value] != undefined)
	{
		//ex: cos(x) = y -> x = arccos(y)
		var index = targeta.par.children.indexOf(targeta);
		targetm.par.children[index] = targetm.children[0];
		targetm.children[0].par = targetm.par;
		
		for(var i=0; i<targetm.par.children.length; i++)
		{
			if(i == index)
				continue;
			var n = new node();
			n.value = targetm.value;
			n.children.push(targetm.par.children[i])
			n.children[n.children.length-1].par = n;
			n.children[n.children.length-1].inverted = 1;
			
			targetm.par.children[i] = n;
			n.par = targetm.par;
		}
		targetm = null;
		return;
	}
	
	else if(targetm == targeta)
		post_splinter();
		
	var index = targeta.par.children.indexOf(targeta);
	for(var i=0; i<targeta.par.children.length; i++)
	{
		if(i == index)
			continue;
		var n = new node();
		n.value = targeta.value;
		
		n.children.push(targeta.par.children[i]);
		n.children[0].par = n;
		
		n.children.push(subtree(targetm));
		n.children[1].par = n;
		n.children[1].inverted = 1 - n.children[1].inverted;
		
		targeta.par.children[i] = n;
		n.par = targeta.par;
	}
	
	targeta.children.splice(targetm.par.children.indexOf(targetm), 1);
	if(targeta.children[0].inverted)
	{
		var n = new node();
		n.value = identity[targeta.value];
		targeta.children.unshift(n);
		n.par = targeta;
	}
	if(targeta.children.length == 1)
	{
		targeta.par.children[index] = targeta.children[0];
		targeta.children[0].par = targeta.par;
		targeta = targeta.children[0];
	}
		
	return;
}

function combine() {}
function commute() {}
function distribute() {}


