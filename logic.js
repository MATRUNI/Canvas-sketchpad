/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d",{willReadFrequently:true});
const color=document.getElementById("colorpick");
const size=document.getElementById('size');
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
ctx.lineCap="round"    // something like brush type
ctx.lineJoin="round"
class Draw
{
    constructor()
    {
        this.drawing=false;
        this.points=[];
        this.undo=null
        this.init();
    }
    init()
    {
        canvas.addEventListener("mousedown", (e)=> this.onMouseDown(e));
        canvas.addEventListener("mousemove", (e)=> this.onMouseMove(e));
        canvas.addEventListener("mouseup",()=> this.onMouseUp());
    }
    setUndoInstance(undoInst)
    {
        this.undo=undoInst
    }
    getMousePosition(e)
    {
        let rc=canvas.getBoundingClientRect()
        return {
            x:e.clientX - rc.left,
            y:e.clientY - rc.top
        }
    }
    smoothPoint(prev, curr, factor = 0.2) {
    return {
        x: prev.x * factor + curr.x * (1 - factor),
        y: prev.y * factor + curr.y * (1 - factor)
    };
    }
    onMouseDown(e)
    {
        ctx.strokeStyle=color.value;  // brush's color
        ctx.lineWidth=size.value     // brush size
        this.drawing=true;
        const pos=this.getMousePosition(e)
        this.points=[pos]
        ctx.beginPath();    // begin 
        ctx.moveTo(pos.x, pos.y)    // from here
    }
    onMouseMove(e)
    {
        if(!this.drawing)
            return;
        const pos=this.getMousePosition(e);

        if(this.points.length>0)
        {
            let last=this.points[this.points.length-1];
            let smoothpos=this.smoothPoint(last, pos)
            this.points.push(smoothpos)
        }
        else
        {
            this.points.push(pos)
        }
        if(this.points.length>=4)
        {
            let p0=this.points[0]
            let p1=this.points[1]
            let p2=this.points[2]
            let p3=this.points[3]

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;

            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            ctx.stroke();   // to this position
            this.points.shift()
        }
        // these mid points for smoother lines

    }
    onMouseUp() 
    {
        if(this.points.length===3)
        {
            const [p0,p1,p2]=this.points;
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y)
            ctx.stroke();
        }
        else if(this.points.length===2)
        {
            const [p0,p1]=this.points;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y)
            ctx.stroke()
        }
        this.points=[];
        this.drawing=false;
        ctx.closePath();
        if(this.undo)
        {
            let snapshot=ctx.getImageData(0, 0, canvas.width, canvas.height)
            this.undo.push(snapshot);
            console.log("snapshot")
        }
    }

    applyState(state)
    {
        if(!state) return;
        ctx.putImageData(state, 0, 0)
    }
}
class UndoStack
{
    constructor(drawInstance)
    {
        this.draw=drawInstance;
        this.stack=[];
        this.top=-1;
        this.init();
    }
    init()
    {
        window.addEventListener("keydown", (e)=>this.keyAction(e))
    }
    keyAction(e)
    {
        if(e.ctrlKey&&e.key==="z")
        {
            e.preventDefault();
            this.undo()
        }
        if(e.ctrlKey&&e.key==="y")
        {
            e.preventDefault();
            this.redo()
        }
    }
    push(value)
    {
        this.top++;
        if(this.stack[this.top])
        {
            this.stack.length=this.top;
        }
        this.stack.push(value);
    }
    undo()
    {
        if(this.top===0) return;
        let state=this.stack[--this.top];
        this.draw.applyState(state)
    }
    redo()
    {
        if(this.top+1 >= this.stack.length) return;
        let state=this.stack[++this.top];
        this.draw.applyState(state)
    }
}
const drawInst=new Draw()
const undoInst=new UndoStack(drawInst)
drawInst.setUndoInstance(undoInst);
let blankState=ctx.getImageData(0, 0, canvas.width, canvas.height)
undoInst.push(blankState);