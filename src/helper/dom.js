function dom(selector)
{
	if(typeof selector === "string") {
		try {
			document.querySelector(selector);
		}
		catch(e) {
			
		}
	}
}

function domSelection(selector)
{
}
