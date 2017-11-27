window.onload = function() {
	open = document.getElementsByClassName("open");
	for (var elem in open) {
		elem.onclick = function() {
			alert("This is open");
		}
	}
}