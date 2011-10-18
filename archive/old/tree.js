operators = ['^', '*', '/', '+', '-', '='];

function node()
{
	this.left = null;
	this.right = null;
	this.par = null;
	this.value = null;
	this.block = null;
}

function mathTree()
{
	this.root = new node();
	this.buildTree = function(arr, place) { add(this.root, arr, place)};
	this.printTree = function() { return print_infix(this.root)};
}

function print_infix(root)
{
//Returns an array of nodes
	var arr = [];
	if(root.left != null)
		arr = arr.concat(print_infix(root.left))

	arr = arr.concat(root);

	if(root.right != null)
		arr = arr.concat(print_infix(root.right));

	if(root && root.par){
	  p_grand = operators.indexOf(root.par.value);
	  p_parent = operators.indexOf(root.value)

    if(p_grand < p_parent){
      //if the grandparent has a higher order of precedence 
      //place the parent in parenthesis.
      LP = new node(); RP = new node();
      LP.value="("; RP.value=")";
      n = [LP];
      n = n.concat(arr);
      arr = n.concat(RP);
    }	
	}
	
	return arr;
}

function add(root, arr, curr)
{  
	if(curr<0 || arr.length == 0)
		return;

	root.value = arr[curr].value;

	root.right = new node();
	if(operators.indexOf(arr[curr-1].value) != -1)
		curr = add(root.right, arr, curr-1);
	else
		root.right.value = arr[--curr].value;
	root.right.par = root;

	root.left = new node();
	if(operators.indexOf(arr[curr-1].value) != -1)
		curr = add(root.left, arr, curr-1);
	else
		root.left.value = arr[--curr].value;
	root.left.par = root;

	return curr;
}

