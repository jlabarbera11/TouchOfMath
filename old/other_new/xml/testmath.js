//point to nodes on the tree
var mtarget;
var ancestor;
var target;

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

function dfs(root, index)
{
	if(root.index == index)
		return root;
	for(var i=0; i<root.children.length; i++)
	{
		var child = dfs(root.children[i], index);
		if(child != null)
			return child;
	}
}
function down(clicked)
//Assigns target, mtarget, and ancestor
//Clicked is the block that has been targeted
{
	save_prev();
	
	target = dfs(tree.root, clicked);
		
	ancestor = target;
	while(ancestor.par.par)
		ancestor = ancestor.par;
		
	if(target != ancestor && inverse[ancestor.value] != undefined && arity[ancestor.value] != 1 && assoc[ancestor.value] == 0)
	{
		mtarget = target;
		while(mtarget.par != ancestor)
			mtarget = mtarget.par;
	}
	else
		mtarget = ancestor;
	
	if(mtarget==ancestor && mtarget.children.length>arity[mtarget.value] && inverse[mtarget.value]!=undefined && place[mtarget.value]==1)
		pre_splinter(clicked);
		
	moving_blocks = tree.printSubtree(mtarget);
}

function pre_splinter(clicked)
{
	var index = blocks.indexOf(clicked);
	if(assoc[ancestor.value] == 0)
	{
		var n = new node;
		n.value = ancestor.value;
		
		n.children.unshift(blocks[index+1].node);
		n.children[0].par = n;
		n.children.unshift(blocks[index-1].node);
		n.children[0].par = n;
		
		ancestor.children.splice(ancestor.children.indexOf(blocks[index-1].node),2,n);
		n.par = ancestor;
		
		mtarget = n;
	}
	
	else if(assoc[ancestor.value] == 1 && ancestor.children.indexOf(blocks[index-1].node) != ancestor.chilren.length-1)
	{
		var n = new node();
		n.value = ancestor.value;
		n.par = ancestor;
		
		n.children = ancestor.children.splice(0,ancestor.children.length-1,n);
		for(var i=0; i<n.children.length; i++)
			n.children[i].par = n;
			
		mtarget = n;
	}
	
	else if(assoc[ancestor.value] == 2 && ancestor.children.indexOf(blocks[index-1].node) != 0)
	{
		var n = new node();
		n.value = ancestor.value;
		n.par = ancestor;
		
		n.children = ancestor.children.splice(1,ancestor.children.length-1,n);
		for(var i=0; i<n.children.length; i++)
			n.children[i].par = n;
			
		mtarget = n;
	}
}

function up()
//When a block is released, this function will determine
//what tree manipulations need to happen
//Will update the blocks array as necessary
{
	//Figures out what the movement did
	//For now, everything is assumed to be a traverse
	traverse();
}

function post_splinter()
//When the target node is an ancestor, a node must be created above it
{
	var n = new node();
	n.value = defop;
	
	var index = ancestor.par.children.indexOf(ancestor);
	
	ancestor.par.children[index] = n;
	n.par = mtarget.par;

	n.children.push(new node());
	n.children[0].value = identity[defop];
	n.children[0].par = n;
	
	n.children.push(mtarget);
	n.children[1].par = n;
	
	ancestor = mtarget.par;
}

function traverse(clicked)
//When an object is moved to the other side of an equals sign, this function is called
//Only updates the tree, not blocks
{

	if(target == ancestor && arity[mtarget.value] == 1 && inverse[mtarget.value] != undefined)
	{
		//ex: cos(x) = y -> x = arccos(y)
		var index = ancestor.par.children.indexOf(ancestor);
		mtarget.par.children[index] = mtarget.children[0];
		mtarget.children[0].par = mtarget.par;
		
		for(var i=0; i<mtarget.par.children.length; i++)
		{
			if(i == index)
				continue;
			var n = new node();
			n.value = mtarget.value;
			n.children.push(mtarget.par.children[i])
			n.children[n.children.length-1].par = n;
			n.children[n.children.length-1].inverted = 1;
			
			mtarget.par.children[i] = n;
			n.par = mtarget.par;
		}
		mtarget = null;
		return;
	}
	
	else if(mtarget == ancestor)
		post_splinter();
		
	var index = ancestor.par.children.indexOf(ancestor);
	for(var i=0; i<ancestor.par.children.length; i++)
	{
		if(i == index)
			continue;
		var n = new node();
		n.value = ancestor.value;
		
		n.children.push(ancestor.par.children[i]);
		n.children[0].par = n;
		
		n.children.push(subtree(mtarget));
		n.children[1].par = n;
		n.children[1].inverted = 1 - n.children[1].inverted;
		
		ancestor.par.children[i] = n;
		n.par = ancestor.par;
	}
	
	ancestor.children.splice(mtarget.par.children.indexOf(mtarget), 1);
	if(ancestor.children[0].inverted)
	{
		var n = new node();
		n.value = identity[ancestor.value];
		ancestor.children.unshift(n);
		n.par = ancestor;
	}
	if(ancestor.children.length == 1)
	{
		ancestor.par.children[index] = ancestor.children[0];
		ancestor.children[0].par = ancestor.par;
		ancestor = ancestor.children[0];
	}
		
	return;
}

