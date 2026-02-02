/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d",{willReadFrequently:true});
const color=document.getElementById("colorpick");
const size=document.getElementById('size');
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
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
        this.brushPos=null
        this.lastPressure=null;
        this.init();
    }
    init()
    {
        canvas.addEventListener("pointerdown", (e)=> this.onPointerDown(e));
        canvas.addEventListener("pointermove", (e)=> this.onPointerMove(e));
        canvas.addEventListener("pointerup",()=> this.onPointerUp());
        canvas.addEventListener("pointercancel", ()=> this.onPointerUp());
        canvas.addEventListener("pointerout", ()=> this.onPointerUp());
    }
    setUndoInstance(undoInst)
    {
        this.undo=undoInst
    }
    getPointerPosition(e)
    {
        // let dpr=window.devicePixelRatio||1;
        let rc=canvas.getBoundingClientRect()
        return {
            x:(e.clientX - rc.left),
            y:(e.clientY - rc.top),
            pressure: e.pressure ?? 0.5,
            type: e.pointerType
        }
    }
    smoothPoint(prev, curr, factor = 0.25)
    {
        return {
            x: prev.x * factor + curr.x * (1 - factor),
            y: prev.y * factor + curr.y * (1 - factor)
        };
    }
    onPointerDown(e)
    {
        ctx.strokeStyle=color.value;  // brush's color
        ctx.lineWidth=size.value     // brush size
        this.drawing=true;
        const pos=this.getPointerPosition(e)
        this.brushPos=pos
        this.lastPressure=pos.pressure
        this.points=[pos,pos]
        ctx.beginPath();    // begin 
        ctx.moveTo(pos.x, pos.y)    // from here
    }
    onPointerMove(e)
    {
        if(!this.drawing)
            return;
        const pos=this.getPointerPosition(e);

        const p = pos.pressure;
        this.lastPressure = this.lastPressure ?? p;
        const smoothPressure = this.lastPressure * 0.7 + p * 0.3;
        this.lastPressure = smoothPressure;
        
        ctx.lineWidth = size.value * smoothPressure;

        this.brushPos = this.brushPos || pos;
        const dx = pos.x - this.brushPos.x;
        const dy = pos.y - this.brushPos.y;
        const dist = Math.hypot(dx, dy);

        const factor = Math.min(0.15 + dist / 50, 0.3);
        this.brushPos = this.smoothPoint(this.brushPos, pos, 0.15);

        const lastSmooth = this.points.length > 0 ? this.points[this.points.length - 1] : pos;

        const smooth=this.smoothPoint(lastSmooth,this.brushPos)
        this.points.push(smooth)


        if(this.points.length>=4)
        {
            this.drawBezier(this.points)
            this.points.shift()
        }
    }
    drawBezier([p0,p1,p2,p3])
    {
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
    
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        ctx.stroke();   // to this position
    }
    onPointerUp() 
    {
        this.points=[];
        this.drawing=false;
        this.brushPos=null;
        this.lastPressure=null
        ctx.closePath();
        if(this.undo)
        {
            let snapshot=ctx.getImageData(0, 0, canvas.width, canvas.height)
            this.undo.push(snapshot);
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