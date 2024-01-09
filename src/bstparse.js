import {TrNode} from "./trnode.js"
function parseBST(jsonString) {
    // Parse the JSON string
    console.log("parseBST(jsonString="+jsonString+")")
    let data = JSON.parse(jsonString);

    // Helper function to recursively create the tree
    function createNode(nodeData) {
        if (!nodeData) return null;

        let node = new TrNode(nodeData.value);
        node.height = nodeData.height;
        node.left = createNode(nodeData.left);
        node.right = createNode(nodeData.right);

        return node;
    }

    // Create the root node and return the tree
    return createNode(data);
}
function load_btn(tree) {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = e => { 
        let file = (e.target).files?.[0]; 
        let reader = new FileReader()
        reader.readAsText(file, "UTF-8")
        reader.onload = readerEvent => {
            let value = readerEvent.target.result
            if (value === ''){
                return
            }
            tree.root = parseBST(value)
        }
    }

    input.click();
}
export {load_btn}