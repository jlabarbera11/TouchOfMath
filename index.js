var tree = null;
var xmlstring = null;

$(document).ready(function()
{
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
    
    $("#doBackend").click(
        function()
        {
            input = $("#equationInput").attr("value");
            input = parse_input(input);
            
            tree = new mathTree();
            xmlstring = tree.buildTree(input);
            
            $("#debug").html(sanitize(xmlstring).replace(/\n/g, "<br />"));
        }
    );
    
    $("#generate").click(
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
    );
    
    $("#display").click(
        function()
        {
            $("#doBackend").click();
            
            errorOccurred = false;
            
            if(tree != null)
            {
                displayEquation(xmlstring);
                postProcessing();
                finalize();
            }
            else
            {
                alert("Error: Tree is null");
            }
        }
    );
    
    $("#showDebugInfo").click(
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
    [0].checked = false;
});
