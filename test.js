var counter = 0;
function update() {
    var counterElement = document.getElementById("counter");
    if (counterElement !== null) {
        counterElement.innerHTML = counter.toString();
    }
    counter += 1;
}
setInterval(update, 500);
