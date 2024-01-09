let counter: number = 0

function update() {
    let counterElement: Element | null = document.getElementById("counter")
    if (counterElement !== null) {
        counterElement.innerHTML = counter.toString()
    }
    counter += 1
}

setInterval(update, 500)
