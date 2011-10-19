function nl2br_js(myString)
{
	return myString.replace( /\n/g, '<br />\n' );
}

function escapeHTML(unsafe)
{
  return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

