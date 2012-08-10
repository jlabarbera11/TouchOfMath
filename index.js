var tree = null;
var xmlstring = null;

$(document).ready(function()
{
    function doBackend()
    {
        input = $("#equationInput").attr("value");
        input = parse_input(input);
        
        tree = new mathTree();
        xmlstring = tree.buildTree(input);
        
        $("#debug").html(sanitize(xmlstring).replace(/\n/g, "<br />"));
    }

    $(document).keydown(
        function(event)
        {
            // Only capture keyboard shortcuts if we are not in a text field
            if(
                !(
                    event.target.tagName.toLowerCase() == "textarea" ||
                    (
                        event.target.tagName.toLowerCase() == "input" &&
                        $(event.target).attr("type") == "text"
                    )
                )
            )
            {
                if(event.ctrlKey)
                {
                    //console.log(event.which);
                    
                    switch(event.which)
                    {
                        case 90:    // 'Z' key
                            event.preventDefault();
                            
                            if(event.shiftKey)
                            {
                                redo();
                            }
                            else
                            {
                                undo();
                            }
                            
                            break;
                        
                        case 89:    // 'Y' key
                            event.preventDefault();
                            
                            if(event.shiftKey)
                            {
                                // Do nothing
                            }
                            else
                            {
                                redo();
                            }
                            
                            break;
                    }
                }
            }
        }
    );
    
    setTimeout("$(window)[0].scrollTo(0, 0);", 500);
    
    $("body").bind("orientationchange",
        function(event)
        {
            //alert(window.orientation);
            
            $(window)[0].scrollTo(0, 0);
        }
    );
    
    $("#equationInput").keydown(
        function(event)
        {
            if(event.which == 13)
            {
                $("#display").click();
            }
        }
    );
    
    $("#equationInput").focus();
    
    /*$("#doBackend").click(
        doBackend()
    );*/
    
    /*$("#generate").click(
        function()
        {
            errorOccurred = false;
            
            if(tree != null)
            {
                displayEquation(xmlstring);
            }
            else
            {
                alert("Error: Tree is null");
            }
        }
    );*/
    
    $("#display").click(
        function()
        {
            //$("#doBackend").click();
            doBackend();
            
            errorOccurred = false;
            
            // Make sure a tree or math error has not occurred
            if(tree != null)
            {
                // Check if the current expression's history (if it exists) needs to be removed
                // before generating the new expression
                if(
                    prevtrees.length == 0 ||
                    (
                        prevtrees.length > 0 &&
                        confirm(
                            "This will start a new expression, " +
                            "the current expression and its history will be removed."
                        )
                    )
                )
                {
                    prevtrees = [];
                    nexttrees = [];
                    
                    displayEquation(xmlstring);
                    displayHistory(prevtrees);
                    postProcessing();
                    finalize();
                }
            }
            else
            {
                alert("Error: Tree is null");
            }
        }
    );
    
    $("#undo").click(
        function()
        {
            undo();
        }
    );
    
    $("#redo").click(
        function()
        {
            redo();
        }
    );
    
    /*$("#showDebugInfo").click(
        function()
        {
            if(this.checked)
            {
                $(".debugInfo").css({"display":""});
            }
            else
            {
                $(".debugInfo").css({"display":"none"});
            }
        }
    )
    .click()
    [0].checked = false;*/
});
