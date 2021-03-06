var errorOccurred = false;
var idPrefix = "i";

jQuery.fn.reverse =
    function()
    {
        return this.pushStack(this.get().reverse(), arguments);
    };

function sanitize(value)
{
    return $("<div />").text(value).html();
}

function parseIndex(value)
{
    return value.substring(idPrefix.length);
}

function setPosition(element, left, top)
{
    //var tempLeft = element.offset().left;
    //var tempTop = element.offset().top;
    
    var tempParentLeft = getParentOffset(element).left;
    var tempParentTop = getParentOffset(element).top;
    
    if(element.hasClass("parameterDivision2"))
    {
        top += getHeight(element) / 2;
    }
    
    element.css(
        {
            "position": "absolute",
            "left": (left - tempParentLeft) + "px",
            "top": (top - tempParentTop) + "px",
            "z-index": 0
        }
    );
}

function getWidth(element)
{
    var width = 0;
    
    if(element.hasClass("operatorSum"))
    {
        width = getWidth(element.children(".operator")) + getWidth(element.children(".parameterSum0").eq(0));
        
    }
    else if(element.hasClass("operatorDivision"))
    {
        width = Math.max(
            getWidth(element.children(".parameterDivision0")),
            getWidth(element.children(".parameterDivision1"))
        );
    
    }
    else if(element.hasClass("operatorPower"))
    {
        tempLeft0 = element.children(".parameterPower0").offset().left;
        tempLeft1 = element.children(".parameterPower1").offset().left;
        
        width = (tempLeft1 - tempLeft0) + getWidth(element.children(".parameterPower1"));
        
    }
    else if(element.hasClass("operatorParentheses"))
    {
        width = getWidth(element.children(".parameterParentheses1")) + getWidth(element.children(".parameterParentheses0")) + getWidth(element.children(".parameterParentheses2"));
        
    }
    else if(element.not("[class~='operator']").filter("[class*='operator']").size() > 0)
    {
        var className = element[0].className
        var startIndex = className.indexOf("operator") + "operator".length;
        var stopIndex = className.indexOf(" ", startIndex);
        var operatorType = className.substring(startIndex, stopIndex);
        
        width = getWidth(element.children(".parameter" + operatorType + "0")) + getWidth(element.children(".parameter" + operatorType + "1")) + getWidth(element.children(".operator"));
        
    }
    else
    {
        width = element.outerWidth();
    }
    
    return width;
}

function getHeight(element)
{
    var height = 0;
    
    if(element.hasClass("operatorSum"))
    {
        height = Math.max(
            element.children(".parameterSum1").eq(0).offset().top - element.children(".parameterSum2").eq(0).offset().top + getHeight(element.children(".parameterSum1").eq(0)),
            getHeight(element.children(".parameterSum0").eq(0))
        );
        
    }
    else if(element.hasClass("operatorDivision"))
    {
        height = getHeight(element.children(".parameterDivision0")) + getHeight(element.children(".parameterDivision1"));
        
    }
    else if(element.hasClass("operatorPower"))
    {
        tempTop0 = element.children(".parameterPower0").offset().top;
        tempTop1 = element.children(".parameterPower1").offset().top;
        
        height = Math.max(
            tempTop0 - tempTop1 + getHeight(element.children(".parameterPower0")),
            getHeight(element.children(".parameterPower1"))
        );
        
    }
    else if(element.hasClass("operatorParentheses"))
    {
        height = Math.max(
            getHeight(element.children(".parameterParentheses1")),
            getHeight(element.children(".parameterParentheses0")),
            getHeight(element.children(".parameterParentheses2"))
        );
        
    }
    else if(element.not("[class~='operator']").filter("[class*='operator']").size() > 0)
    {
        var className = element[0].className
        var startIndex = className.indexOf("operator") + "operator".length;
        var stopIndex = className.indexOf(" ", startIndex);
        var operatorType = className.substring(startIndex, stopIndex);
        
        height = Math.max(
            getHeight(element.children(".parameter" + operatorType + "0")),
            getHeight(element.children(".parameter" + operatorType + "1")),
            getHeight(element.children(".operator"))
        );
        
    }
    else
    {
        height = element.outerHeight();
    }
    
    return height;
}

function getParentOffset(element)
{
    // This returns the absolute position (relative to the document) of the container whose css
    // "position" attribute has a value of "relative" or "absolute" because the "absolute"
    // positioning of the original element is actually relative to this container
    
    var parentOffsetFilterText = "[class*='parameterSum'], [class*='parameterDivision'], [class*='parameterPower'], #container";
    var left = 0;
    var top = 0;
    
    if(element.parents(parentOffsetFilterText).size() > 0)
    {
        left = element.parents(parentOffsetFilterText).eq(0).offset().left;
        top = element.parents(parentOffsetFilterText).eq(0).offset().top;
    }
    
    return {left: left, top: top};
}

function displayEquation(xml)
{
    var $xml = $($.parseXML(xml));
    
    var output = "";
    
    for(i = 0; i < $xml.children().size(); i++)
    {
        output += elementToHtml($xml.children().eq(i));
    }
    
    if(!errorOccurred)
    {
        $("#equation").html(output);
    }
    else
    {
        $("#equation").html("<span class='parameterPower1'>An error occurred while parsing the XML<\/span>");
    }
    
    $("#postProcessing").click(
        function()
        {
            postProcessing();
        }
    );
    
    $("#finalize").click(
        function(event)
        {
            finalize();
        }
    );
    
    function findBlockIndex(currentIndex, pageX, pageY)
    {
        // This function returns the index of the block that the cursor or finger is above, or an
        // empty string ("") if there is no block is under the cursor/finger
        
        var blockIndex = "";
        
        $(".clickable").each(
            function()
            {
                if(blockIndex == "")
                {
                    if(
                        pageX >= $(this).offset().left &&
                        pageX <= $(this).offset().left + $(this).outerWidth() &&
                        
                        pageY >= $(this).offset().top &&
                        pageY <= $(this).offset().top + $(this).outerHeight()
                    )
                    {
                        blockIndex = parseIndex($(this).attr("id"));
                        
                        for(j = 0; j < currentIndex.length; j++)
                        {
                            if(blockIndex == currentIndex[j])
                            {
                                blockIndex = "";
                            }
                        }
                    }
                }
            }
        );
        
        return blockIndex;
    }
    
    var oldLeft;
    var oldTop;
    
    var offsetX;
    var offsetY;
    
    var tempParentLeft;
    var tempParentTop;
    
    var selector;
    
    var index;
    var overIndex;
    
    var $xmlToMove;
    
    var selectedIndex = new Array();
    
    function pseudoMouseDown(target, pageX, pageY)
    {
        oldLeft = {};
        oldTop = {};
        
        offsetX = {};
        offsetY = {};
        
        oldZIndex = 0;
        
        tempParentLeft = {};
        tempParentTop = {};
        
        selector = {};
        
        index = parseIndex($(target).attr("id"));
        overIndex = index;
        
        $(target).css({"z-index": 1});
        
        selectedIndex[0] = index;
        
        oldLeft[0] = $(target).offset().left;
        oldTop[0] = $(target).offset().top;
        
        offsetX[0] = oldLeft[0] - pageX;
        offsetY[0] = oldTop[0] - pageY;
        
        tempParentLeft[0] = getParentOffset($(target)).left;
        tempParentTop[0] = getParentOffset($(target)).top;
        
        selector[0] = idPrefix + index;
        
        if(index == "")
        {
            alert("index = \"\" in mousedown");
        }
        else
        {
            $xmlToMove = $($.parseXML(down(index)));
            
            $xmlToMove.find("[index]").each(
                function(i)
                {
                    var tempSelector = idPrefix + $(this).attr("index");
                    
                    selectedIndex[i + 1] = $(this).attr("index");
                    
                    if(tempSelector != $(target).attr("id") && $("#" + tempSelector).size() > 0)
                    {
                        selector[i + 1] = tempSelector;
                        
                        oldLeft[i + 1] = $("#" + tempSelector).offset().left;
                        oldTop[i + 1] = $("#" + tempSelector).offset().top;
                        
                        offsetX[i + 1] = oldLeft[i + 1] - pageX;
                        offsetY[i + 1] = oldTop[i + 1] - pageY;
                        
                        tempParentLeft[i + 1] = getParentOffset($("#" + tempSelector)).left;
                        tempParentTop[i + 1] = getParentOffset($("#" + tempSelector)).top;
                    }
                }
            );
            
            $("#debug").html("You clicked the element with index='" + index + "'");
        }
    }
    
    function pseudoMouseMove(pageX, pageY)
    {
        for(i in offsetX)
        {
            $("#" + selector[i]).css(
                {
                    "position": "absolute",
                    "left": (pageX + offsetX[i] - tempParentLeft[i]) + "px",
                    "top": (pageY + offsetY[i] - tempParentTop[i]) + "px"
                }
            );
        }
    }
    
    function pseudoMouseUp(target, pageX, pageY)
    {
        function snapBack(){
            for(i in oldLeft){
                $("#" + selector[i]).animate(
                    {
                        "left": (oldLeft[i] - tempParentLeft[i]) + "px",
                        "top": (oldTop[i] - tempParentTop[i]) + "px"
                    },
                    "fast"
                );
            }
        }
        
        overIndex = findBlockIndex(selectedIndex, pageX, pageY);
    
        $(target).css({"z-index": 0});
        
        $(document).unbind("mousemove").unbind("mouseup");
        
        if(overIndex != "" && index != overIndex)
        {
            xmlstring = up(index, overIndex);
            
            errorOccurred = false;
            
            if(tree != null)
            {
                displayEquation(xmlstring);
                postProcessing();
                finalize();
            }
            else
            {
                alert("Tree is null");
            }
        }
        else
        {
            up(index, index);
            snapBack();
        }
    }
    
    $(".clickable").bind("touchstart",
        function(event)
        {
            event.preventDefault();
            
            pseudoMouseDown(
                event.target,
                event.originalEvent.changedTouches[0].pageX,
                event.originalEvent.changedTouches[0].pageY
            );
        }
    ).bind("touchmove",
        function(event)
        {
            event.preventDefault();
            
            pseudoMouseMove(
                event.originalEvent.changedTouches[0].pageX,
                event.originalEvent.changedTouches[0].pageY
            );
        }
    ).bind("touchend",
        function(event)
        {
            pseudoMouseUp(
                event.target,
                event.originalEvent.changedTouches[0].pageX,
                event.originalEvent.changedTouches[0].pageY
            );
        }
    );
    
    $(".clickable").mousedown(
        function(event)
        {
            pseudoMouseDown(event.target, event.pageX, event.pageY);
            
            $(document).mousemove(
                function(event)
                {
                    pseudoMouseMove(event.pageX, event.pageY);
                }
            ).mouseup(
                function(event)
                {
                    $(document).unbind("mousemove").unbind("mouseup");
                    
                    pseudoMouseUp(event.target, event.pageX, event.pageY);
                }
            );
            
            return false;
        }
    );
}

function elementToHtml(element)
{
    if(!errorOccurred)
    {
        if(element[0] == undefined)
        {
            alert("Error Parsing XML: \nNull or undefined element \n(element[0] = undefined in 'elementToHtml()')");
            
            errorOccurred = true;
            
            return "<span class='operator error'>ERROR<\/span>";
            
        }
        else
        {
            output = "unset";
            
            if(element.filter("parameter").size() > 0)
            {
                output = parameterToHtml(element);
            }
            else if(element.filter("operator").size() > 0)
            {
                if(specialDisplayOperator[element.attr("type")])
                {
                    output = specialElementToHtml(element);
                }
                else
                {
                    var elementClass = "operator" + operatorClassNameCharacters[element.attr("type")];
                    
                    if(element.parent().eq(0).filter("operator").size() > 0)
                    {
                        elementClass += " parameter" + operatorClassNameCharacters[element.parent().eq(0).attr("type")] + element.index();
                    }
                
                    switch(place[element.attr("type")])
                    {
                        case 0:        // Operator before parameters
                            output = "<span class='" + elementClass + "'>" + operatorToHtml(element);
                            
                            for(i = 0; i < arity[element.attr("type")]; i++)
                            {
                                output += elementToHtml(element.children().eq(i));
                            }
                            
                            output += "<\/span>";
                            
                            break;
                        
                        case 1:        // Operator in between paramters
                            output =
                            "<span class='" + elementClass + "'>" +
                                elementToHtml(element.children().eq(0)) +
                                operatorToHtml(element) +
                                elementToHtml(element.children().eq(1)) +
                            "<\/span>";
                            
                            break;
                        
                        case 2:        // Operator after parameters
                            output = "<span class='" + elementClass + "'>";
                            
                            for(i = 0; i < arity[element.attr("type")]; i++)
                            {
                                output += elementToHtml(element.children().eq(i));
                            }
                            
                            output += operatorToHtml(element) + "<\/span>";
                            
                            break;
                        
                        default:
                            alert("Error parsing XML: \nUnknown Operator \"" + element.attr("type") + "\" \n(No 'place' table entry)");
                            
                            output = "<span class='operator error'>ERROR<\/span>";
                            errorOccurred = true;
                            break;
                    }
                }
            }
            else if(element.filter("parsererror").size() > 0)
            {
                alert("Error parsing XML: \n\"parsererror\" generated by '$.parseXML()' in 'displayEquation()' \n(message generated in 'elementToHtml()')");
                
                output = "<span class='operator error'>ERROR<\/span>";
                errorOccurred = true;
                
            }
            else
            {
                alert("Error parsing XML: \nUnknown tag \"" + element[0].tagName + "\"\n in 'elementToHtml()'");
                
                output = "<span class='operator error'>ERROR<\/span>";
                
                errorOccurred = true;
            }
            
            return output;
        }
    }
    else
    {
        return "<span class='operator error'>ERROR Occurred<\/span>";
    }
}

function specialElementToHtml(element)
{
    
    var output;
    var elementClass = "operator" + operatorClassNameCharacters[element.attr("type")];
    
    if(element.parent().eq(0).filter("operator").size() > 0)
    {
        elementClass += " parameter" + operatorClassNameCharacters[element.parent().eq(0).attr("type")] + element.index();
    }
    
    switch(element.attr("type"))
    {
        case "/":
            output =
                "<span class='" + elementClass + "'>" +
                    elementToHtml(element.children().eq(0)) +
                    "<div class='operator parameterDivision2' width='0'><\/div>" +
                    elementToHtml(element.children().eq(1)) +
                "<\/span>";
            
            break;
        
        case "sum":
            // Sumation of parameter0 from parameter1 to parameter2
            
            output =
                "<span class='" + elementClass + "'>" +
                    operatorToHtml(element) +
                    elementToHtml(element.children().eq(1)) +
                    elementToHtml(element.children().eq(2)) +
                    elementToHtml(element.children().eq(0)) +
                "<\/span>";
                
            break;
        
        case "parentheses":
            output =
                "<span class='" + elementClass + "'>" +
                    "<span class='operator parameterParentheses1'>(<\/span>" +
                    elementToHtml(element.children().eq(0)) +
                    "<span class='operator parameterParentheses2'>)<\/span>" +
                "<\/span>";
            
            break;
        
        case "^":
            output =
                "<span class='" + elementClass + "'>" +
                    elementToHtml(element.children().eq(0)) +
                    elementToHtml(element.children().eq(1)) +
                "<\/span>";
            
            break;
        
        default:
            output =
                "<span id='SDO' class='clickable " + elementClass + "'>" +
                    "UO: \"" + sanitize(element.attr("type")) + "\"" +
                "<\/span>";
            
            alert("Error: \nUnimplemented operator \"" + element.attr("type") + "\" \n(Unimplemented case in 'specialElementToHtml()' function)");
            errorOccurred = true;
            break;
    }
    
    return output;
}

function parameterToHtml(element)
{
    var elementClass = "clickable";
    
    if(element.parent().eq(0).filter("operator").size() > 0)
    {
        elementClass += " parameter" + operatorClassNameCharacters[element.parent().eq(0).attr("type")] + element.index();
    }
    
    return "<span class='" + elementClass + "' id='" + idPrefix + sanitize(element.attr("index")) + "'>" + sanitize(element.attr("type")) + "<\/span>";
}

function operatorToHtml(element)
{
    if(operatorCharacters[element.attr("type")] == undefined)
    {
        alert("Error displaying equation: \nUndefined operator \"" + element.attr("type") + "\" \n(No 'operatorCharacters' table entry)");
        
        return "<span class='clickable operator' id='" + idPrefix + sanitize(element.attr("index")) + "'>&lt;" + sanitize(element.attr("type")) + "&gt;<\/span>";
    }
    else
    {
        return "<span class='clickable operator' id='" + idPrefix + sanitize(element.attr("index")) + "'>" + operatorCharacters[element.attr("type")] + "<\/span>"
    }
}

function postProcessing()
{
    postProcess();
}

function postProcess()
{
    $(".operatorPower").each(
        function()
        {
            tempTop0 = $(this).children().eq(0).offset().top;
            tempTop1 = $(this).children().eq(1).offset().top;
            
            $(this).children().eq(1).css(
                {
                    "position": "relative",
                    "top": (tempTop0 - tempTop1) + "px"
                }
            );
        }
    );
    
    $(".operatorSum").each(
        function()
        {
            var tempWidthOperator = $(this).children(".operator").eq(0).outerWidth();
            var tempWidth1 = $(this).children(".parameterSum1").eq(0).outerWidth();
            var tempWidth2 = $(this).children(".parameterSum2").eq(0).outerWidth();
            
            $(this).children(".parameterSum1").eq(0).css(
                {
                    "position": "relative",
                    "left": (-.5 * (tempWidth1 + tempWidthOperator)) + "px"
                }
            );
            
            $(this).children(".parameterSum2").eq(0).css(
                {
                    "position": "relative",
                    "left": (-.5 * (tempWidth2 + tempWidthOperator) - tempWidth1) + "px"
                }
            );
            
            $(this).children(".parameterSum0").eq(0).css(
                {
                    "position": "relative",
                    "left": (-1 * (tempWidth1 + tempWidth2)) + "px",
                    "margin-right": -(tempWidth1 + tempWidth2) + "px"
                }
            );
        }
    );
    
    $(".operatorDivision").reverse().each(
        function()
        {
            var tempWidth0 = getWidth($(this).children(".parameterDivision0").eq(0));
            var tempWidth1 = getWidth($(this).children(".parameterDivision1").eq(0));
            
            if(tempWidth0 > tempWidth1)
            {
                $(this).children(".parameterDivision1").eq(0).css(
                    {
                        "position": "relative",
                        "left": (-.5 * (tempWidth0 + tempWidth1)) + "px",
                        "margin-right": (-tempWidth1) + "px"
                    }
                );
            }
            else
            {
                // Todo: Investigate the arbitrary offset on the margin
                $(this).children(".parameterDivision0").eq(0).css(
                    {
                        "position": "relative",
                        "left": (.5 * (tempWidth0 + tempWidth1) - tempWidth0) + "px",
                        "margin-right": -(tempWidth0 + 4) + "px"
                    }
                );
            }
            
            var tempHeight0 = getHeight($(this).children(".parameterDivision0").eq(0));
            var tempHeight1 = getHeight($(this).children(".parameterDivision1").eq(0));
            
            $(this).children(".parameterDivision0").eq(0).css({"position": "relative", "top": (-tempHeight0 / 2) + "px"});
            $(this).children(".parameterDivision1").eq(0).css({"position": "relative", "top": (tempHeight1 / 2) + "px"});
            $(this).children(".parameterDivision2").eq(0).css({"position": "relative", "top": (0) + "px"});
        });
    
    $(".parameterParentheses1, .parameterParentheses2").each(
        function()
        {
            var tempHeight = getHeight($(this).siblings(".parameterParentheses0"));
            
            //$(this).css({/*"height": tempHeight + "px",*/ "font-size": (.7 * tempHeight) + "px"});
        }
    );
}

function finalize()
{
    $(".clickable, .operator, [class*='parameterSum'], [class*='parameterDivision'], [class*='parameterPower']").reverse().each(
        function(i)
        {
            var tempLeft = $(this).offset().left;
            var tempTop = $(this).offset().top;
            
            //var tempParentLeft = getParentOffset($(this)).left;
            //var tempParentTop = getParentOffset($(this)).top;
            
            //if($(this).hasClass("parameterDivision2")){
            //    tempTop += getHeight($(this)) / 2;
            //}
            
            //$(this).css({"position": "absolute", "left": (tempLeft - tempParentLeft) + "px", "top": (tempTop - tempParentTop) + "px", "z-index": 0});
            
            //alert("about to absolute-position-ize: #" + $(this).attr("id") + "." + $(this).attr("class"));
            
            setPosition($(this), tempLeft, tempTop);
            //alert("done. next...");
            $(this).css({"z-index": 0});
        }
    );
    
    $(".operatorDivision").each(
        function()
        {
            var tempWidth0 = getWidth($(this).children(".parameterDivision0").eq(0)) - 2;
            var tempWidth1 = getWidth($(this).children(".parameterDivision1").eq(0)) - 2;
            
            var tempLeft0 = $(this).children(".parameterDivision0").eq(0).offset().left;
            var tempLeft1 = $(this).children(".parameterDivision1").eq(0).offset().left;
            
            //var tempTop0 = $(this).children(".parameterDivision0").eq(0).offset().top;
            //var tempTop1 = $(this).children(".parameterDivision1").eq(0).offset().top;
            
            // Since both parameterDivision elements have the same parent, we only have to define one
            // i.e. (tempParentLeft0 = tempParentLeft1 = tempParentLeft) and
            // (tempParentTop0 = tempParentTop1 = tempParentTop)
            //var tempParentLeft = getParentOffset($(this).children(".parameterDivision0").eq(0)).left;
            //var tempParentTop = getParentOffset($(this).children(".parameterDivision0").eq(0)).top;
            
            if(tempWidth0 > tempWidth1)
            {
                //$(this).children(".parameterDivision2").eq(0).css(
                    //{
                        /*"position": "absolute",
                        "left": (tempLeft0 - tempParentLeft) + "px",*/
                        /*"top": (tempTop1 - tempParentTop) + "px",*/
                        //"width": tempWidth0 + "px"
                    //}
                //);
                
                setPosition($(this).children(".parameterDivision2").eq(0), tempLeft0);
                
                $(this).children(".parameterDivision2").eq(0).css({"width": tempWidth0 + "px"});
            }
            else
            {
                //$(this).children(".parameterDivision2").eq(0).css(
                    //{
                        /*"position": "absolute",
                        "left": (tempLeft1 - tempParentLeft) + "px",*/
                        /*"top": (tempTop1 - tempParentTop) + "px",*/
                        //"width": tempWidth1 + "px"
                    //}
                //);
                
                setPosition($(this).children(".parameterDivision2").eq(0), tempLeft1);
                $(this).children(".parameterDivision2").eq(0).css({"width": tempWidth1 + "px"});
            }
        }
    );
    
    var minTop = $("#equationInput").offset().top + $("#equationInput").outerHeight();
    
    $(".clickable, .operator").each(
        function(i)
        {
            // This checks to make sure nothing is sticking up off the top edge of the page. If an
            // element is sticking off the top edge of the page, the entire equation is moved down until
            // it is remedied.
            
            if($(this).offset().top < minTop)
            {
                var tempOffsetTop = minTop - $(this).offset().top;
                
                $(".clickable, .operator").each(
                    function(j)        // Shift all elements down
                    {
                        setPosition($(this), $(this).offset().left, $(this).offset().top + tempOffsetTop);
                    }
                );
            }
        }
    );
}