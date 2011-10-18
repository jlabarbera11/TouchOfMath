function dump_expr(Expr)
{
  if(!Expr)
    return "FAIL: nil";
  var a = print_infix(Expr);
  var string = "";
  for(i = 0; i < a.length; i++)
    string += a[i].value;
  return string;
}

function isOp(Val)
{
  if(Val == 0)
    return true;
  return operators.indexOf(Val) != -1;
}

function QPop()
{
 if(Q.length == 0)
   return null;
 n = Q[0];
 Q = Q.slice(1);
 return n;
}

/* global state var marking history to avoid cycles */
var transform_history = new Array();

function getroot(node)
{
  var n = null;
  n = node;
  while(n.par)
    n = n.par;
  return n;
}
/*
 N-> Target node
 Goal-> Abstract Goal
*/

function bfs(N, Goals)
{
 Q = [N]

 
 console.log("**************Start expr:" + dump_expr(N)+"*************");
 //initialize transform history
 delete transform_history;
 transform_history = new Array();

 is_new_transform(N);
 
 while(Expr = QPop(Q)) {
   console.log("popped->" + dump_expr(Expr));
 
   if(satisfies(getroot(Expr), Goals)){
     console.log("satisfied goals");
     return Expr;
   }
   for(var i = 0; i < rules.length; i++) {
    var ret = transform_expression(Expr, rules[i]);
    for(j = 0; ret && j < ret.length; j++){
      if(!is_new_transform(ret[j]))
        continue;
      console.log("got new transform->" + dump_expr(ret[j]) + ' from ' + dump_expr(Expr) + '  using ' + rules[i]);
      Q.push(ret[j]); 
    }
   }
   
   if(Q.length > 100){
     //error condition
     console.log("HIT HARD LIMIT");
     return null;
   }
 }
 
 return null;
}

function do_bind(Expr, Pattern, hash)
{
  if(!Expr || Pattern.length == 0) return null;
  if(Pattern.constructor == Array) {
    if(isOp(Pattern[1])){
      //make sure that the operator value matches
      if(Expr.value != Pattern[1])
        return null;
    }
    hash[Pattern[1]] = Expr.value;
    ret = do_bind(Expr.left, Pattern[0], hash);
    if(!ret) return null;
    ret = do_bind(Expr.right, Pattern[2], hash);
    if(!ret) return null;
  }
  else {
    //if an operator, make sure it matches
    if(isOp(Pattern)){
      if(Expr.value != Pattern)
        return null;
    }
    hash[Pattern] = copy_node(Expr);
  }
  return hash;
}

function check_bindings(Bindings, Pattern, careOperator)
{
  for(i = 0; i < Pattern.length; i++){
    if(!careOperator && isOp(Pattern[i]) != -1)
      continue;
    if(typeof Pattern[i] == "string"){
//      console.log("check that >" + Pattern[i] + ">" + (bindings[Pattern[i]] != null));
      if(bindings[Pattern[i]] == null){
        console.log("missing + ", Pattern[i]);
        return null;      
      }
    } else {
      if(!check_bindings(Bindings, Pattern[i]))
        return null;
      }
  }
  return 1;
}

function match_and_bind(Expr, Pattern)
{
  var hash = new Array();
  bindings = do_bind(Expr, Pattern, hash);

  if(!bindings) return null;

  //Tverify that everything inside the Pattern has
  //a binding...
  if(!check_bindings(bindings,Pattern, true))
    return null;

  return bindings;
}

/*
TODO:
  This function is not tested properly,
  and it might have some errors with a nested array
  replacement on a value
*/
function do_mutate(Mutant, Binding, Replacement)
{
  if(Replacement.constructor == Array) {
    //verify that the operator matches
    Mutant = new node();

    /* create a binding for operators, even if they werent bound 
      this allows inverting rules, etc
    */
    if(!Binding[Replacement[1]] && isOp(Replacement[1]))
      Binding[Replacement[1]] = Replacement[1];
      
    //XXX what happens if Replacement[1] IS REALLY AN ARRAY HERE? fail
    //XXX on second thought, the value in a binary tree should never be an array
    Mutant.value = Replacement[1];
    
    Mutant.left = new node();
    Mutant.right = new node();
    Mutant.left = do_mutate(Mutant.left, Binding, Replacement[0]);
    Mutant.right = do_mutate(Mutant.right, Binding, Replacement[2]);
    if(!Mutant.left ||  !Mutant.right)
      console.log("uhoh");    
  } else {
    
    if(!Binding[Replacement] && isOp(Replacement)){
      Binding[Replacement] = new node(Replacement);
    } else if(!Binding[Replacement]){
      console.log("dun dun dun");      
    }
      
    Mutant = Binding[Replacement];    
  }

  //    console.log("mutated:: " + dump_expr(Mutant))
  return Mutant;
}

function mutate_with_binding(Binding, Replacement)
{
//this is the exciting bit, some real transformation here
//basically sub out bindings into the rule
//  Expr.right.value = Binding['L'];
//  Expr.left.value = Binding['R'];
  //check that every replacement has a binding

  if(!check_bindings(Binding, Replacement, false))
    return null;
  
//XXX  Binding = replace_missing_ops(Binding, Replacement);
  
  new_expr = do_mutate(new node(), Binding, Replacement);  
  return new_expr;
}

function is_new_transform(T)
{
  //do some hash
  var hash = dump_expr(T);
  
  if(transform_history[hash] == null){
    transform_history[hash] = 1;
    return 1;
  }
  else{
    return 0; //duplicated transform
  }
  return 1; // new transform
}
/*
Check if Rule can be applied to an Expr
*/
function transform_expression(Expr, Rule)
{
  var Transforms = [];
//  console.log("Transforming-> " + dump_expr(Expr));
  pattern = Rule[0];
  //skip Rule[1] == >>>
  replace = Rule[2];
  
  //try to bind to each possible node in the expression
  if(Expr.left){
    ret = transform_expression(Expr.left, Rule);
    for(i = 0; i < ret.length; i++)  {
      expr_copy = copy_node(Expr);
      expr_copy.left = ret[i];
      Transforms.push(expr_copy);
    }
  }
  
  if(Expr.right){
    ret = transform_expression(Expr.right, Rule);
    for(i = 0; i < ret.length; i++)  {
      expr_copy = copy_node(Expr);
      expr_copy.right = ret[i];
      Transforms.push(expr_copy);
    }
  }
  

  //finally try to bind on this node
  bindings = match_and_bind(Expr, pattern);
  
  if(bindings != null) {
//    console.log("got bindings");
    transform = mutate_with_binding(bindings, replace);
    if(transform != null){
//      console.log("got transform");
//      console.log("New Transform-> " + dump_expr(transform));
      Transforms.push(transform);
    }
  }
  
  return Transforms;
}

/*Check if all Goals are satisfied in Tree
*/
function satisfies(Expr, Goals)
{
  if(Goals.constructor == Array){
    for(var i = 0; i < Goals.length; i++){
      if(!does_satisfy(Expr, Goals[i]))
        return false;
    }
    return true;
  }else{
    return does_satisfy(Expr, Goals);    
  }
}
/*
Check if Goal is satisfied in Tree
*/
function does_satisfy(Expr, Goal)
{
  //if Goal is null, fail to match if Expr is not NULL
  if(!Goal){
    if(!Expr){
//      console.log("true because both nil");
      return true;
    }
//    console.log("false because Expr w/out Goal")    
    return false;
  }
  //if Expr is null, only match if goal is wildcard with 
  // no leaves
  if(!Expr){
    if(Goal.value == '*any*'){
//      console.log("returning true if goal has no children.."+(!Goal.left && !Goal.right));
      return (!Goal.left && !Goal.right);
    }
  }

  //if current goal is a wildcard
  if(Goal.value == '*any*')
  {
//      console.log("Goal is a wildcard");
      if(Goal.left || Goal.right){
//        console.log("checking goal children");
        /////errr not sure if the following is right
        /////needs testing

        
        //try to match children first
        if(Goal.left)
        {
//          console.log("Checking left");
          //advance goal left
          if(does_satisfy(Expr, Goal.left))
            return true;
          if(does_satisfy(Expr.left, Goal.left))
            return true;
        }
        if(Goal.right)
        {
//          console.log("Checking right");
          //advance goal right
          if(does_satisfy(Expr, Goal.right))
            return true;
          if(does_satisfy(Expr.right, Goal.right))
            return true;
//          console.log("Advancing both didnt work");
        }        

        //if they didn't match, recurse and make sure left/right
        //can be matched by the wildcard

//        console.log("Failed, making sure rest works out");
        return false; //todo
  
        //do not advance goal
        if(!does_satisfy(Expr.left, Goal))
          return false;
        if(!does_satisfy(Expr.right, Goal))
          return false;
        
        //left right were matched, success
//        console.log("true because fell through w/ left right matches")
        return true;
      } else {
//        console.log("Goal had no children, checking that blah");
        //goal has no children, wildcard versus expression
        if(!does_satisfy(Expr.left, Goal))
          return false;
        if(!does_satisfy(Expr.right, Goal))
          return false;
        //success. goal has no children, everything satisfied.
//        console.log("true2 because fell through w/ left right matches")
        return true;
      }
  } else {
    if(Expr && Goal.value == Expr.value){
//      console.log("Goal had a value that matched...")
      //they matched, ensure children match.
      //advance goal and expr left
//      console.log("Advance both left");
      if(!does_satisfy(Expr.left, Goal.left))
        return false;

//      console.log("Good, advance both right");        
      //advance goal and expr right
      if(!does_satisfy(Expr.right, Goal.right))
        return false;

//      console.log("goal with value checks passed return true");
      return true;
    }
    if(!Expr)
      return false;
//    console.log("Goal and Expr mismatch");
//    console.log(Goal.value);
//    console.log(Expr.value);
    return false;
  }
}

