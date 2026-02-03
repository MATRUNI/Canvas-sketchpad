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
        let rc=canvas.getBoundingClientRect()
        return {
            x:(e.clientX - rc.left),
            y:(e.clientY - rc.top),
            pressure: e.pressure ?? 0.5,
            type: e.pointerType
        }
    }
    onPointerDown(e) 
    {
        this.drawing = true;
        const pos = this.getPointerPosition(e);
        this.brushPos = pos;
        this.lastPressure = pos.pressure;
        this.points = [pos];
        this.lastMidX = pos.x;
        this.lastMidY = pos.y;
        
        ctx.strokeStyle = color.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    onPointerMove(e) 
    {
        if (!this.drawing) return;

        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

        for (let event of events) {
            const pos = this.getPointerPosition(event);

        this.lastPressure = this.lastPressure ?? pos.pressure;
        this.lastPressure = this.lastPressure * 0.5 + pos.pressure * 0.5;

        this.points.push({ x: pos.x, y: pos.y, p: this.lastPressure });

        if (this.points.length >= 3) {
            const p1 = this.points[this.points.length - 2];
            const p2 = this.points[this.points.length - 1];

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            ctx.beginPath();
            ctx.lineWidth = size.value * p1.p;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';


            ctx.moveTo(this.lastMidX, this.lastMidY);
            ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
            ctx.stroke();

            this.lastMidX = midX;
            this.lastMidY = midY;

            this.points.shift();
            }
        }
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