import Display from "./gamestift/display.js";

export default class Game
{
    constructor()
    {
	    addEventListener("load", () => this.onPageLoad());
    }
    
    onPageLoad()
    {
		this.display = new Display({antialias: false, alpha: false});
		this.display.resize(800, 600);
		this.display.appendTo(document.body);
    }
}
