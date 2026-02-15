import { getStroke } from "https://esm.sh/perfect-freehand";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d",{willReadFrequently:true});
const color=document.getElementById("colorpick");
const bgColor=document.getElementById("colorpick1");
const size=document.getElementById('size');
const undo=document.getElementById("undo-container")
const dpr = window.devicePixelRatio || 1;
function resizeCanvas() {
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
        this.strokes=[];
        this.undo=null
        this.brushPos=null
        this.zom;
        this.lastPressure=null;
        this.line=null;
        this.init();
    }
    init()
    {
        canvas.addEventListener("pointerdown", (e)=>{
            if(e.target !==canvas) return
             this.onPointerDown(e)
            });
        canvas.addEventListener("pointermove", (e)=> this.onPointerMove(e));
        canvas.addEventListener("pointerup",()=> this.onPointerUp());
        canvas.addEventListener("pointercancel", ()=> this.onPointerUp());
        canvas.addEventListener("pointerout", ()=>{ 
            if(!this.drawing) return;
            this.onPointerUp()
        });
    }
    setUndoInstance(undoInst)
    {
        this.undo=undoInst
    }
    getPointerPosition(e)
    {
        let rc=canvas.getBoundingClientRect()
        let mouseX= (e.clientX -rc.left)*dpr;
        let mouseY= (e.clientY -rc.top)*dpr;

        let worldX= this.zom.camX + mouseX/this.zom.zoom;
        let worldY= this.zom.camY + mouseY/this.zom.zoom;

        return {
            x:worldX,
            y:worldY,
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
        this.lastMidX = pos.x;
        this.lastMidY = pos.y;
        
        ctx.strokeStyle = color.value;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    onPointerMove(e) {
        if (!this.drawing) return;

        const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];

        for (let event of events) {
            const pos = this.getPointerPosition(event);

            this.lastPressure = this.lastPressure ?? pos.pressure;
            this.lastPressure = this.lastPressure * 0.5 + pos.pressure * 0.5;

            this.points.push([pos.x, pos.y, this.lastPressure]);
        }

        this.zom.draw(); // just re-render
    }

    onPointerUp() {
        if (!this.points.length) return;

        const stroke = getStroke(this.points, {
            size: size.value,
            thinning: 0.7,
            smoothing: 0.5,
            streamline: 0.5,
            simulatePressure: false
        });

        this.strokes.push({
            stroke,
            color: color.value
        });

        this.points = [];
        this.drawing = false;
        this.lastPressure = null;
        this.zom.draw();
        if (this.undo) {
            this.undo.push(this.strokes);
        }
    }
}
class UndoStack
{
    constructor(drawInstance,zom)
    {
        this.draw=drawInstance;
        this.zom=zom;
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
        this.stack.push(JSON.parse(JSON.stringify(value)));
    }
    undo()
    {
        if(this.top<0) return;
        this.top--;
        if(this.top===-1)
        {
            this.draw.strokes=[];
            this.zom.draw();
            return;
        }
        let state=JSON.parse(JSON.stringify(this.stack[this.top]));
        this.draw.strokes=state;
        this.zom.draw()
    }
    redo()
    {
        if(this.top+1 >= this.stack.length) return;
        let state=JSON.parse(JSON.stringify(this.stack[++this.top]));
        this.draw.strokes=state
        this.zom.draw()
    }
}
class Zoom
{
    constructor(drawInst)
    {
        this.ctx=ctx;
        this.zoom=1
        this.camX = -canvas.width / (2 * this.zoom);
        this.camY = -canvas.height / (2 * this.zoom);
        this.canvas=canvas;
        this.drawins=drawInst
        this.draw()
    }
    resetCanvas()
    {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    applyCamera()
    {
        this.ctx.setTransform(this.zoom*dpr, 0, 0, this.zoom*dpr, this.zoom*dpr*-this.camX, this.zoom*dpr*-this.camY);
    }

    drawWorldGrid()
    {
        this.ctx.strokeStyle = "#ccc";
        for (let x = -2000; x <= 2000; x += 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, -2000);
          this.ctx.lineTo(x, 2000);
          this.ctx.stroke();
        }
    
        for (let y = -2000; y <= 2000; y += 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(-2000, y);
          this.ctx.lineTo(2000, y);
          this.ctx.stroke();
        }
    
        this.ctx.fillStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    draw() 
    {
        this.resetCanvas();
        this.applyCamera();
        // this.drawWorldGrid()

        // draw saved strokes
        for (let s of this.drawins.strokes) {
            this.ctx.fillStyle = s.color;
            this.drawStroke(s.stroke);
        }

        // draw current live stroke
        if (this.drawins.points.length > 1) {
            const liveStroke = getStroke(this.drawins.points, {
                size: size.value,
                thinning: 0.7,
                smoothing: 0.5,
                streamline: 0.5,
                simulatePressure: false
            });

            this.ctx.fillStyle = color.value;
            this.drawStroke(liveStroke);
        }
    }
    drawStroke(stroke) {
        if (!stroke.length) return;

        this.ctx.beginPath();
        this.ctx.moveTo(stroke[0][0], stroke[0][1]);

        for (let i = 1; i < stroke.length; i++) {
            this.ctx.lineTo(stroke[i][0], stroke[i][1]);
        }

        this.ctx.closePath();
        this.ctx.fill();
    }

    zooming(deltaY)
    {
        let zoomFactor=1.1;

        let mouseX= (this.canvas.width/dpr)/2;
        let mouseY= (this.canvas.height/dpr)/2;

        let worldX= this.camX + mouseX /this.zoom;
        let worldY= this.camY + mouseY /this.zoom;

        if(deltaY>0)
        {
            this.zoom=this.zoom*zoomFactor
        }
        else
        {
            this.zoom=this.zoom/zoomFactor;
        } 
        
        this.camX= worldX - mouseX/this.zoom;
        this.camY= worldY - mouseY/this.zoom;

        this.draw();
    }
}
const drawInst=new Draw()
let zom=new Zoom(drawInst);
const undoInst=new UndoStack(drawInst,zom)
drawInst.setUndoInstance(undoInst);
drawInst.zom=zom;


class Listener
{
    constructor()
    {
        this.init()
    }
    init()
    {
        undo.addEventListener("click", e=>{
            e.stopPropagation();
            e.preventDefault();
            if(e.target.textContent==="<-")
            {
                undoInst.undo()
            }
            else if(e.target.textContent==="->")
            {
                undoInst.redo()
            }
        });

        canvas.addEventListener('wheel', (e)=>{
            e.preventDefault();
            zom.zooming(e.deltaY)
        });

        bgColor.addEventListener('input', (e)=>{
            canvas.style.background=e.target.value;
            e.target.blur

        })
    }
}
new Listener()