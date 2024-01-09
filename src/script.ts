"use strict";

import "./style.css";
import "./mui.min.css";
import {load_btn} from "./bstparse.js";
import { TrNode } from "./trnode.js";
import {Vec2, Strokebox, box, norm, Line} from "./tools.js"
window.onload = () => {
    let canvas: HTMLCanvasElement | null = null
    let ctx: CanvasRenderingContext2D | null = null
    const insert_button = document.getElementById("send") as HTMLButtonElement
    const load_button = document.getElementById("load") as HTMLButtonElement
    const insert_input = document.getElementById("input") as HTMLInputElement
    const clear_button = document.getElementById("cler") as HTMLButtonElement

    const box_height = 30
    let canvas_init = false;
    let scale = 0.99;
    let shiftX = 0;
    let shiftY = 50
    function sscale(position: Vec2, delta: number) {
        scale += delta < 0 ? -0.1 : 0.1
        /*
        shiftX -= position.x * scale*0.01;
        shiftY -= position.y * scale*0.01;
        */
    }
    class Tree {
        root: TrNode | null = null
        protected leftRotate(this: Tree, x: TrNode): void {
            console.log("left")
            const y = x.right
            console.log(x+', '+y)
            x.right = y.left
            if (y.left !== null)
                y.left.parent = x
            y.parent = x.parent
            if (x.parent === null)
                this.root = y
            else if (x === x.parent.left)
                x.parent.left = y
            else
                x.parent.right = y
            y.left = x
            x.parent = y
            x.height = x.getMaxHeight() + 1
            y.height = y.getMaxHeight() + 1
            console.log(x+', '+y)
        }
        protected rightRotate(this: Tree, y: TrNode): void {
            console.log("right")
            const x = y.left
            y.left = x.right
            if (x.right !== null)
                x.right.parent = y
            x.parent = y.parent
            if (y.parent === null)
                this.root = x
            else if (y === y.parent.right)
                y.parent.right = x
            else
                y.parent.left = x
            x.left = y
            y.parent = x

            y.height = y.getMaxHeight() + 1
            x.height = x.getMaxHeight() + 1
        }
    
        add_fixup(this: Tree, node: TrNode): void {
            let x = node
            let rconut = 0;
            while (x !== null) {
                x.height = x.getMaxHeight() + 1
                if (rconut >= 30) 
                    break
                const balance = x.balance()
                if (balance > 1) {
                    if (x.left != null && x.left.balance() < -1)
                        this.leftRotate(x.left)
                    this.rightRotate(x)
                }
                
                else if (balance < -1) {
                    if (x.left != null && x.right.balance() > 1)
                        this.leftRotate(x.right)
                    this.leftRotate(x)
                }
                x = x.parent
                rconut ++;
            }
        }
        add_node(this: Tree, value: number): void {
            let nn = new TrNode(value)
            let x: TrNode | null = this.root
            let y: TrNode | null = null
            while (x !== null){
                y = x
                if (x.value >= value){
                    x = x.left
                } else {
                    x = x.right
                }
            }
            nn.parent = y
            if (y === null) {
                this.root = nn
                return
            }
            // nn.parent = y
            let p = y;
            if (y.value >= value){
                y.left = nn
            } else {
                y.right = nn
            }
            this.add_fixup(nn)
        }
    }
    
    let tree: Tree = new Tree();
    // tree.add_node(25)
    // tree.add_node(20)
    // tree.add_node(50)
    // tree.add_node(-10)
    // tree.add_node(30)
    // tree.add_node(23)
    // tree.add_node(11)
    // tree.add_node(-30)
    // tree.add_node(22)
    // tree.add_node(24.5)
    // tree.add_node(28)
    // tree.add_node(35)
    // tree.add_node(79)
    // tree.add_node(68)
    // tree.add_node(82.83)
    // tree.add_node(-40)
    // tree.add_node(-50)

    insert_button.onclick = () => {
        let value = Number(insert_input.value)
        if (isNaN(value) || insert_input.value === ''){
            insert_input.value = ""
            return
        }
        console.log(value)
        insert_input.value = ""
        tree.add_node(value)
        console.log(tree)
    }

    load_button.onclick = () => {
        load_btn(tree)
    }
    clear_button.onclick = () => {
        tree.root = null
    }
    function update() {
        // debugger
        if (canvas === null) {
            canvas = document.getElementById("canvas") as HTMLCanvasElement
        }
        
        if (canvas === null) {
            return
        }
        if (ctx === null) {
            ctx = canvas.getContext("2d")
        }
        if (ctx === null) {
            return
        }
        if (!canvas_init) {
            canvas?.addEventListener("click", (event) => {
                console.log(event)
            })
            canvas?.addEventListener("keypress", (event) => {
                console.log(event)
            })
            canvas?.addEventListener("wheel", (event: WheelEvent) => {
                let delta = event.deltaY;
                console.log(event)
                const canvas_rect = canvas.getBoundingClientRect()
                const cx = canvas_rect.left
                const cy = canvas_rect.top
                let position = new Vec2(event.clientX-cx, event.clientY-cy)
                sscale(position, delta)
            })
            canvas_init = true
        }
        box("#FFFFFF", 0, 0, canvas.width, canvas.height, ctx, canvas)
        let x, y, w;
        x = canvas.width / 2
        w = canvas.width
        y = 0
        let last_lay: TrNode[] = []
        let last_lay_p: Number[][] = []
        for (let i = 0; i < 5; i++) {
            let lay: TrNode[] = []
            let lay_p: Number[][] = []
            for (let j = 0; j < canvas.width/w; j ++) {
                let tx = j*w
                let ty = y;
                Strokebox("#ababab", tx*scale+shiftX, ty*scale+shiftY, w*scale, box_height*scale, ctx, canvas)
                if (w === canvas.width) {
                    tree.root?.render((tx+w/2)*scale+shiftX, (ty+box_height/2)*scale+shiftY, canvas, ctx, scale)
                    lay.push(tree.root)
                    lay_p.push([(tx+w/2)*scale+shiftX, (ty+box_height/2)*scale+shiftY])
                }
            }
            for (let oldnode of last_lay) {
                let node = oldnode
                if (node !== null && node !== undefined) {
                    lay.push(node.left)
                    lay.push(node.right)
                }
            }
            for (let j = 0; j < lay.length; j ++) {
                let tx = j * w
                let ty = y;
                
                if (w !== canvas.width) {
                    let node = lay[j]
                    if (node !== null && node !== undefined) {
                        let o = j / 2;
                        o -= o % 1
                        if (w/2*scale < 13) {
                            break
                        }
                        let ow // last_lay_p[o]
                        ow = [(tx+w/2)*scale-Number(last_lay_p[o][0])+shiftX, (ty+box_height-11)*scale-Number(last_lay_p[o][1])+shiftY]
                        ow = norm(ow[0], ow[1])
                        ow[0] = ow[0]*13*scale+Number(last_lay_p[o][0])
                        ow[1] = ow[1]*13*scale+Number(last_lay_p[o][1])

                        Line("#555555", (tx+w/2)*scale+shiftX, (ty+box_height-11)*scale+shiftY, ow[0], ow[1], ctx, canvas)
                        node.render((tx+w/2)*scale+shiftX, (ty+box_height-11)*scale+shiftY, canvas, ctx, scale)
                        lay_p.push([(tx+w/2)*scale+shiftX, (ty+box_height-11)*scale+shiftY])
                    }
                }
            }
            //console.log(last_lay_p)
            /*
            for (let j = 0; j < last_lay.length; j++) {
                
                if (!(w === canvas.width || last_lay_p === undefined || 
                    last_lay_p === null || 
                    last_lay_p[j] === undefined 
                    || last_lay_p[j] === null || last_lay === undefined || 
                    last_lay === null || 
                    last_lay[j] === undefined 
                    || last_lay[j] === null))
                {
                    last_lay[j].render(Number(last_lay_p[j][0]), Number(last_lay_p[j][1]))
                }
            }*/
            last_lay_p = lay_p
            last_lay = lay
            y += box_height;
            w /= 2;
        }

        // tree.root?.render(canvas.width / 2, 50)
        // ctx.textAlign = "left"
        // ctx.fillText(recursion_counter.toString(), 10, 10)

    }

    setInterval(update, 5)
}