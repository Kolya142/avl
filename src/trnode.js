import {Text, rgb, Vec2} from "./tools.js"
class TrNode {
    value
    left = null
    right = null
    parent = null
    height = 1
    
    left_height() {
        return this.left === null ? 0 : this.left.height
    }

    right_height() {
        return this.right === null ? 0 : this.right.height
    }

    getMaxHeight() {
        return Math.max(this.left_height(), this.right_height())
    }
    balance() {
        return this.left_height() - this.right_height()
    }
    constructor(value) {
        this.value = value
    }
    render(x, y, canvas, ctx, scale) {
        if (canvas === null || ctx === null) {
            return
        }
        ctx.beginPath()
        ctx.ellipse(x, y, 13*scale, 11.5*scale, 0, 0, 360)
        ctx.fillStyle = "#ffffff"
        ctx.fill("nonzero")
        ctx.strokeStyle = "#bbbbbb"
        ctx.stroke()
        Text(rgb(51, 51, 51), new Vec2(x, y), this.value.toString(), 13*scale + "px Arial", ctx)
        let p = new Vec2(1, -1)
        p.mul(13*scale)
        p.add(new Vec2(x, y))
        Text(rgb(51, 51, 51), p, this.height.toString(), 12*scale + "px Arial", ctx)
        // console.log(x, y, 10, 10, 0, 0, 360)
    }
}
export {TrNode}