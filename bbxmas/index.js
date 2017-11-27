var img = document.getElementsByClassName("calendar-img")[0];
var boxes = document.getElementsByClassName("boxes")[0]

function create_box(i) {
	var w = ((img.width - 0.1 * img.width) / 6) * 0.95;
	var h = ((img.height - 0.1 * img.height) / 10) * 0.95;
	var x = (0.04 * img.width + ((i - 1) % 5) * (1.1 * w));
	var y = -(0.96 * img.height - Math.floor((i - 1) / 5) * (1.1 * h));

	var node = document.createElement("li");
	boxes.appendChild(node);
	node.classList.add("day" + (i + 1));
	
	node.style.width = w + "px";
	node.style.height = h + "px";
	node.style.top = y + "px";
	node.style.left = x + "px";
	
	var innerNode = document.createElement("a");
	node.appendChild(innerNode);
	innerNode.innerHTML = i;
	innerNode.href = "";
}

(function() {
	for (var i = 1; i < 26; i++) {
		console.log("Creating box " + i);
		create_box(i);
	}
})();