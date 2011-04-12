function isalnum(input){
  if(input.match(/^[a-zA-Z0-9]+$/)){
    return true;
  } else {
    return false;
  }
}
//TODO: parentheses, functions, exponents, unary operators
//dijkstra'Z shunting-yard,
// haad ik maar en tijdmachine
//infix to postfix converter
function infix_to_postfix(blocks)
{
  //INPUT: blocks with nodes
  //OUTPUT: array of post order nodes
  postfix = [];
  opstack = [];
  
  for(var idx = 0; idx < blocks.length; idx++){
    token = blocks[idx];

    op = operators.indexOf(token);
    if(op != -1) {
      while(1) {
        prev = opstack[opstack.length-1];
        if(!prev || prev.value == "("){
          opstack.push(blocks[idx]);
          break;
        } else {
          //note: < vs <= here makes a difference
          //for things like 3+3*4+2. 
          //the result will be technically equivalent
          //but not of the preferred form for tree transformations
          if (op > operators.indexOf(prev.value)) {
            opstack.push(blocks[idx]);
            break;
          } else {
            postfix.push(opstack.pop());
          }
        }
      }
    } else if(token == "("){
      opstack.push( blocks[idx] )
    } else if (token == ")") {
      while(opstack.length > 0)
      {
        val = opstack.pop();
        if(val.value != "(") {
          postfix.push(val)
        } else {
          break;
        }
      } 
      //todo check for stack error if opstack.length == 0
    } else {
      postfix.push(blocks[idx]);
    }
  }

  while(opstack.length > 0) {
    postfix.push(opstack.pop());
  }
  return postfix; 
}

var tree;
function postfix_to_tree(input)
{
  nodestack = [];
  tree = new mathTree();
  
  tree.buildTree(nodestack, nodestack.length-1);
}


function p_to_i(input, output)
{
  output.innerHTML = input;
}
