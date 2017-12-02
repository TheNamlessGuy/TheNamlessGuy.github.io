var img = document.getElementsByClassName("calendar-img")[0];
var boxes = document.getElementsByClassName("boxes")[0]
var screenCenterW = window.innerWidth / 2;
var date = new Date();
var body = document.getElementsByTagName("body")[0];

var modal = document.getElementsByClassName("modal")[0];
var modaltitle = document.getElementsByClassName("modaltitle")[0];
var modalimg = document.getElementsByClassName("modalimg")[0];
var modaltext = document.getElementsByClassName("modaltext")[0];
var modalowner = document.getElementsByClassName("modalowner")[0];

var DECEMBER = 11;
var DAYS_PER_ROW = 7;

function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}

function create_box(i) {
	var w = 100;
	var h = w;

	var offset_w = w * 1.1;

	var x = screenCenterW - ((DAYS_PER_ROW / 2.0) * offset_w) + ((i - 1) % DAYS_PER_ROW) * offset_w;
	if (x < 0) x = 0;
	var y = Math.floor((i - 1) / DAYS_PER_ROW) * (1.1 * h) - (DAYS_PER_ROW * (1.1 * h)) + 75;
	if (y < -715) y = -715;

	var node = document.createElement("div");
	node.classList.add("box");
	node.id = i;
	
	var innerNode = document.createElement("img");
	innerNode.src = "days/" + i;
	innerNode.alt = i;
	
	if (date.getFullYear() > 2017 || (date.getMonth() == DECEMBER && date.getDate() >= i)) {
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
	
	body.style.overflow = "scroll";
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
	body.style.overflow = "hidden";
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
	
	if (detectmob()) {
		DAYS_PER_ROW = 1;
		modal.style["padding-top"] = "1px";
	}
	
	for (var i = 1; i < 32; i++) {
		create_box(i);
	}
})();