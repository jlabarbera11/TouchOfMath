operators = ['^', '*', '/', '+', '-','='];

function node(value)
{
	this.left = null;
	this.right = null;
	this.par = null;
	this.value = value;
}

function addleft(n, value)
{
  n.left = new node();
  n.left.value = value;
  n.left.par = n;
}

function addright(n, value)
{
  n.right = new node();
  n.right.value = value;
  n.right.par = n;
}

function mathTree()
{
	this.root = new node();
	this.buildTree = function(arr, place) { add(this.root, arr, place)};
	this.printTree = function(){ return print_infix(this.root); };
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
      LP = new node(null); RP = new node(null);
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

//    alert(arr + " " + curr);
	root.value = arr[curr];

	root.right = new node(null);
	if(operators.indexOf(arr[curr-1]) != -1)
		curr = add(root.right, arr, curr-1);
	else
		root.right.value = arr[--curr];
	root.right.par = root;

	root.left = new node(null);
	if(operators.indexOf(arr[curr-1]) != -1)
		curr = add(root.left, arr, curr-1);
	else
		root.left.value = arr[--curr];
	root.left.par = root;

	return curr;
}

function do_copy(src, dst)
{
  if(!src)
    return nil;

  dst.value = src.value;
  dst.left = src.left;
  dst.right = src.right;
  if(src.left)
    do_copy(src.left, dst.left);
  if(src.right)
    do_copy(src.right, dst.right);
  return dst;
}
function copy_node(root)
{
  return do_copy(root, new node());
}
