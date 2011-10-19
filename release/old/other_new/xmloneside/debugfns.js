function nl2br_js(myString){
	return myString.replace( /\n/g, '<br />\n' );
}

function escapeHTML(unsafe) {
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

function filter_xml(xmlstring)
{
	xmlstring = escapeHTML(xmlstring);
	xmlstring = nl2br_js(xmlstring);
	return xmlstring;
}

