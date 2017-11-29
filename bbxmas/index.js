var img = document.getElementsByClassName("calendar-img")[0];
var boxes = document.getElementsByClassName("boxes")[0]
var screenCenterW = window.innerWidth / 2;
var date = new Date();

var modal = document.getElementsByClassName("modal")[0];
var modaltitle = document.getElementsByClassName("modaltitle")[0];
var modalimg = document.getElementsByClassName("modalimg")[0];
var modaltext = document.getElementsByClassName("modaltext")[0];
var modalowner = document.getElementsByClassName("modalowner")[0];

var DECEMBER = 10;

function create_box(i) {
	var w = 125;
	var h = w;

	var offset_w = w * 1.1;

	var x = screenCenterW - (2 * offset_w + (offset_w / 2)) + ((i - 1) % 5) * offset_w;
	if (x < 0) x = 0;
	var y = Math.floor((i - 1) / 5) * (1.1 * h) - (5 * (1.1 * h)) - 25;
	if (y < -650) y = -650;
	
	if (i > 21)
		i += 6;

	var node = document.createElement("div");
	node.classList.add("box");
	node.id = i;
	
	var innerNode = document.createElement("img");
	innerNode.src = "days/" + i;
	innerNode.alt = i;
	
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

function reset_modal() {
	modal.style.display = "none";
	
	modaltitle.innerHTML = "";
	modaltitle.style.display = "none";
	
	modalimg.src = "";
	modalimg.style.display = "none";
	
	modaltext.innerHTML = "";
	modaltext.style.display = "none";
	
	modalowner.innerHTML = "";
	modalowner.style.display = "none";
}

function set_modal(title, img, text, owner) {
	reset_modal();
	if (title != null) {
		modaltitle.innerHTML = title;
		modaltitle.style.display = "block";
	}
	
	if (img != null) {
		modalimg.src = img;
		modalimg.style.display = "block";
	}
	
	if (text != null) {
		modaltext.innerHTML = text;
		modaltext.style.display = "block";
	}
	
	if (owner != null) {
		modalowner.innerHTML = "Event owner: " + owner;
		modalowner.style.display = "block";
	}
	
	modal.style.display = "block";
}

function open_box(node) {
	if (node.classList.contains("closed")) {
		set_modal("This day isn't available yet", null, null, null);
	} else {
		display = displayText[node.id];
		if (display == null || display.title == null) {
			set_modal("This day hasn't had its event set yet", null, null, null);
		} else {
			set_modal(display.title, display.img, display.text, display.owner);
		}
	}
	return false;
}

(function() {	
	document.getElementsByClassName("close")[0].onclick = function() {
		reset_modal();
	}
	
	window.onclick = function(event) {
		if (event.target == modal) {
			reset_modal();
		}
	}
	
	for (var i = 1; i < 26; i++) {
		create_box(i);
	}
})();