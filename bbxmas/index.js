var img = document.getElementsByClassName("calendar-img")[0];
var boxes = document.getElementsByClassName("boxes")[0]
var screenCenterW = window.innerWidth / 2;
var date = new Date();

var modal = document.getElementsByClassName("modal")[0];
var modaltitle = document.getElementsByClassName("modaltitle")[0];
var modaltext = document.getElementsByClassName("modaltext")[0];

var displayText = {
	1: {title: "A giveaway", text: "Day 1"},
	2: {title: "Movienight", text: "Day 2"},
	3: {title: "Some other dumb shit", text: "Day 3"},
	4: {title: "I dont know", text: "Day 4"},
};

var DECEMBER = 10;

function create_box(i) {
	var w = 125;
	var h = w;

	var offset_w = w * 1.1;

	var x = screenCenterW - (2 * offset_w + (offset_w / 2)) + ((i - 1) % 5) * offset_w;
	var y = Math.floor((i - 1) / 5) * (1.1 * h) - (5 * (1.1 * h)) - 25;
	
	if (i > 21)
		i += 6;

	var node = document.createElement("div");
	node.classList.add("box");
	node.id = i;
	
	var innerNode = document.createElement("img");
	innerNode.src = "days/" + i;
	
	if (date.getMonth() == DECEMBER && date.getDate() >= i) {
		node.classList.add("open");
		innerNode.src += "open";
	} else {
		node.classList.add("closed");
		innerNode.src += "closed";
	}
	innerNode.src += ".png";
	boxes.appendChild(node);
	
	node.style.width = w + "px";
	node.style.height = h + "px";
	node.style.top = y + "px";
	node.style.left = x + "px";
	
	innerNode.onclick = function() {
		open_box(node);
	};
	
	node.appendChild(innerNode);
	
	console.log("Created box for day " + i);
}

function open_box(node) {
	if (node.classList.contains("closed")) {
		modal.style.display = "block";
		modaltitle.innerHTML = "This day isn't available yet";
		modaltext.innerHTML = "";
	} else {
		modal.style.display = "block";
		display = displayText[node.id];
		modaltitle.innerHTML = (display == null) ? "This days text hasn't been set yet" : display.title;
		modaltext.innerHTML = (display == null) ? "This days text hasn't been set yet" : display.text;
	}
	return false;
}

(function() {	
	document.getElementsByClassName("close")[0].onclick = function() {
		modal.style.display = "none";
	}
	
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
	
	for (var i = 1; i < 26; i++) {
		create_box(i);
	}
})();