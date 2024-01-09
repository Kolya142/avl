class Vec2 {
    x
    y
    constructor(x, y=null) {
        this.x = x
        if (y !== null)
            this.y = y
        else
            this.y = x
    }
    
    magn() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }
    norm() {
        let mag = magn(this.x, this.y)
        return [this.x/mag, this.y/mag]
    }
    add(vec) {
        if (typeof(vec) === 'number')
            vec = new Vec2(vec)
        this.x += vec.x
        this.y += vec.y
    }
    minus(vec) {
        if (typeof(vec) === 'number')
            vec = new Vec2(vec)
        this.x -= vec.x
        this.y -= vec.y
    }
    mul(vec) {
        if (typeof(vec) === 'number')
            vec = new Vec2(vec)
        this.x *= vec.x
        this.y *= vec.y
    }
    div(vec) {
        if (typeof(vec) === 'number')
            vec = new Vec2(vec)
        this.x /= vec.x
        this.y /= vec.y
    }
}

function Text(color, pos, text, font, ctx, align = "center", baseline = "middle") {
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = baseline
    ctx.fillText(text, pos.x, pos.y)
}

function fill(color, ctx, canvas) {
    if (ctx === null || canvas === null) {
        return
    }
    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}
function box(color, x, y, width, height, ctx, canvas) {
    if (ctx === null || canvas === null) {
        return
    }
    ctx.fillStyle = color
    ctx.fillRect(x, y, width, height)
}
function Strokebox(color, x, y, width, height, ctx, canvas) {
    if (ctx === null || canvas === null) {
        return
    }
    ctx.strokeStyle = color
    ctx.strokeRect(x, y, width, height)
}
function Line(color, x1, y1, x2, y2, ctx, canvas) {
    if (ctx === null || canvas === null) {
        return
    }
    
    ctx.strokeStyle = color
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.stroke();
}
function pixel(color, x, y, ctx, canvas) {
    if (ctx === null || canvas === null) {
        return
    }
    ctx.fillStyle = color
    ctx.fillRect(x, y, 1, 1)
}
function magn(x, y) {
    return Math.sqrt(x * x + y * y)
}
function norm(x, y) {
    let mag = magn(x, y)
    return [x/mag, y/mag]
}

const rgb = (r, g, b) => 'rgb(' + r + ', ' + g + ', '+ b + ')'
export {Text, Vec2, pixel, norm, magn, box, Line, Strokebox, fill, rgb}