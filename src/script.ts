"use strict";

import "./style.css";
import "./mui.min.css";
import {load_btn} from "./bstparse.js";
import { TrNode, cloneTreeNode } from "./trnode.js";
import {Vec2, Strokebox, box, norm, Line} from "./tools.js"
window.onload = () => {
    let canvas: HTMLCanvasElement | null = null
    let ctx: CanvasRenderingContext2D | null = null
    const insert_button = document.getElementById("send") as HTMLButtonElement
    const load_button = document.getElementById("load") as HTMLButtonElement
    const insert_input = document.getElementById("input") as HTMLInputElement
    const clear_button = document.getElementById("cler") as HTMLButtonElement
    const delete_button = document.getElementById("delt") as HTMLButtonElement
    const prev_button = document.getElementById("left") as HTMLButtonElement
    const next_button = document.getElementById("right") as HTMLButtonElement
    const frame_field = document.getElementById("frame") as HTMLInputElement
    const savin_field = document.getElementById("savinfo") as HTMLInputElement
    const asave_button = document.getElementById("asave") as HTMLButtonElement
    const aload_button = document.getElementById("aload") as HTMLButtonElement
    const dem_but_set = document.getElementById("dem-set") as HTMLButtonElement
    let but_checked: null|HTMLInputElement = null
    function add_radio_button(label: string, func: Function) {
        let div = document.createElement("div")
        let button = document.createElement("input")
        let labelE = document.createElement("label")
        labelE.innerHTML = label
        button.type = "radio"
        button.addEventListener("change", () => {
            if (but_checked !== null)
                but_checked.checked = false
            but_checked = button
            func()
        })
        div.appendChild(button)
        div.appendChild(labelE)
        dem_but_set.appendChild(div)
    }
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
            x.right = y
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
                    if (x.left != null && x.left.balance() < 0)
                        this.leftRotate(x.left)
                    this.rightRotate(x)
                }
                
                else if (balance < -1) {
                    if (x.left != null && x.right.balance() > 0)
                        this.leftRotate(x.right)
                    this.leftRotate(x)
                }
                x = x.parent
                rconut ++;
            }
        }
        add_node(this: Tree, value: number): void|TrNode {
            let nn = new TrNode(value)
            let x: TrNode | null = this.root
            let y: TrNode | null = null
            while (x !== null){
                y = x
                if (x.value == value) {
                    return
                }
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
            return nn;
        }
        search_node(this: Tree, value: number): TrNode | null {
            let x: TrNode | null = this.root
            while (x !== null){
                if (x.value === value) {
                    return x
                }
                if (x.value >= value){
                    x = x.left
                } else {
                    x = x.right
                }
            }
            return null
            //this.add_fixup(nn)
        }
        delete_node(this: Tree, value: number): TrNode | void {
            const x: TrNode | null = this.search_node(value)
            if (x === null || x === undefined) {
                return
            }
            if (x.right === null) {
                this.transplant(x, x.left)
                this.add_fixup(x.left)
            }
            else if (x.left === null) {
                this.transplant(x, x.right)
                this.add_fixup(x.right)
            }
            else {
                const y = this.tree_minimum(x.right)
                if (y.parent !== x) {
                    this.transplant(y, y.right)
                    y.right = x.right
                    y.right.parent = x
                    this.add_fixup(x.right)
                }
                this.transplant(x, y)
                y.left = x.left
                y.left.parent = x
                this.add_fixup(y)
            }
            return x
        }
        tree_minimum(this: Tree, root: TrNode): TrNode {
            let min = root
            while (min.left !== null) {
                min = min.left
            }
            return min
        }
        transplant(u: TrNode, v: TrNode) {
            if (u.parent === null) {
                this.root = v
            }
            else if (u === u.parent.left) {
                u.parent.left = v
            }
            else {
                u.parent.right = v
            }
            if (v !== null)
                v.parent = u.parent
        }
    }
    
    let tree: Tree = new Tree();
    function serializeTree(node: TrNode): object {
        if (node === null) {
            return null;
        }
    
        return {
            value: node.value,
            height: node.height,
            left: serializeTree(node.left),
            right: serializeTree(node.right)
            // Omitting the parent property to avoid circular references
        };
    }
    function deserializeTree(json: TrNode, parent: TrNode = null) {
        if (json === null) {
            return null;
        }
    
        let node = new TrNode(json.value);
        node.height = json.height;
        node.parent = parent;
        node.left = deserializeTree(json.left, node);
        node.right = deserializeTree(json.right,node);
        return node;
    }
    function treeToBase64(): string {
        const json = JSON.stringify(serializeTree(tree.root));
        return btoa(json);
    }
    function base64ToTree(base64: string) {
        const json = atob(base64);
        tree.root = deserializeTree(JSON.parse(json));
    }
    
    
    
    class HistoryItem{
        state: TrNode
        description: string
        constructor(description: string, state: TrNode) {
            this.state = state
            this.description = description
        }
        load() {
            tree.root = this.state
        }
    }
    class History{
        storage: Array<HistoryItem>
        frame: number
        constructor(){
            this.storage = []
            this.add_change("init")
            this.frame = 0
        }
        add_change(description: string) {
            const ctree = cloneTreeNode(tree.root)
            //console.log(ctree)
            const next = new HistoryItem(description, ctree)
            this.storage.push(next)
            console.log(this.frame)
            this.frame += 1
            let f = this.frame
            console.log(this.frame, f)
            add_radio_button(description, () => {
                this.frame = f
                this.load()
            })
            console.log(this.storage, this.frame)
        }
        load() {
            console.log(this.storage, this.frame, this.storage[this.frame])
            this.storage[this.frame].load()
            frame_field.value = this.frame.toString()
        }
        next() {
            if (this.frame == this.storage.length-1)
                return
            this.frame += 1
            this.load()
        }
        prev() {
            if (this.frame == 0)
                return
            this.frame -= 1
            this.load()
        }
        add_node(value: number) {
            this.add_change("add: " + value)
        }
        del_node(value: number) {
            this.add_change("del: " + value)
        }
        clear_node() {
            this.add_change("clear")
        }
    }
    const history = new History()
    tree.add_node(1)
    tree.add_node(-1)
    tree.add_node(11)
    tree.add_node(10)
    tree.add_node(21)
    tree.add_node(45)
    tree.add_node(25)
    tree.add_node(20)
    tree.add_node(50)
    tree.add_node(-10)
    tree.add_node(30)
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
        history.add_node(value)
        console.log(tree)
    }

    load_button.onclick = () => {
        load_btn(tree)
    }
    clear_button.onclick = () => {
        tree.root = null
        history.clear_node()
    }
    next_button.onclick = () => {
        history.next()
        console.log("next")
    }
    prev_button.onclick = () => {
        history.prev()
        console.log("prev")
    }
    asave_button.onclick = () => {
        savin_field.value = treeToBase64()
    }
    aload_button.onclick = () => {
        base64ToTree(savin_field.value)
    }
    delete_button.onclick = () => {
        let value = Number(insert_input.value)
        if (isNaN(value) || insert_input.value === ''){
            insert_input.value = ""
            return
        }
        console.log(value)
        insert_input.value = ""
        let x = tree.delete_node(value)
        console.log(x)
        history.del_node(value)
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