import { getStroke } from "https://esm.sh/perfect-freehand";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d",{willReadFrequently:true});
const color=document.getElementById("colorpick");
const bgColor=document.getElementById("colorpick1");
const size=document.getElementById('size');
const undo=document.getElementById("undo-container")
const clear_btn=document.getElementById("clear-btn")
const options = document.querySelectorAll(".zoom-option");
const sliderZoom = document.querySelector(".zoom-slider");
const mode_change=document.getElementById("mode");
const mode_container=document.getElementById("mode-container");
const eraser=document.getElementById("eraser");
const dpr = window.devicePixelRatio || 1;

let canvasRect = canvas.getBoundingClientRect();
function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    canvasRect = canvas.getBoundingClientRect();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
ctx.lineCap="round"    // something like brush type
ctx.lineJoin="round"
class Draw
{
constructor() {
        this.drawing = false;
        this.points = []; // Stores: {x, y, pressure} in World Space
        this.interpolatedPoints = []; // Stores: [x, y, p] for Perfect-Freehand
        this.strokes = [];
        this.activePointers=new Set();
        this.pendingDraw = null;
        this.isPinching = false;
        this.mode="draw";
        this.eraser=null;
        
        this.ropeSize = 15;    // Pixels (Screen Space)
        this.spacing = 3;     // Pixels (Screen Space)
        this.currentScreenPos = { x: 0, y: 0 }; 
        
        this.init();
    }
    init()
    {
        canvas.addEventListener("pointerdown", (e)=>{
            if(drawInst.mode!=="draw") return;
            this.activePointers.add(e.pointerId)
            canvas.setPointerCapture(e.pointerId)
            if(this.activePointers.size>1)
            {
                this.isPinching=true;
                if(this.pendingDraw)
                {
                    clearTimeout(this.pendingDraw)
                    this.pendingDraw=null
                }
                this.drawing=false;
                return;
            }
            if(e.target !==canvas) return
            this.pendingDraw=setTimeout(() => {
                if(!this.isPinching)
                {
                    this.onPointerDown(e)
                }
                this.pendingDraw=null
            }, 40);
            });
        canvas.addEventListener("pointermove", (e)=> {
            if(drawInst.mode!=="draw") return;
            this.onPointerMove(e)
        });
        canvas.addEventListener("pointerup",(e)=> {
            if(drawInst.mode!=="draw") return;
            this.activePointers.delete(e.pointerId);

            if(this.activePointers.size===0)
            {
                this.isPinching=false;
            }
            if(this.pendingDraw)
            {
                clearTimeout(this.pendingDraw)
                this.pendingDraw=null
            }
            this.onPointerUp()
        });
        canvas.addEventListener("pointercancel", (e)=> {
            if(drawInst.mode!=="draw") return;
            this.activePointers.delete(e.pointerId);
            this.onPointerUp()
        });
        canvas.addEventListener("pointerout", (e)=>{ 
            this.activePointers.delete(e.pointerId);
            if(this.drawing)
            this.onPointerUp()
        });
    }
    setUndoInstance(undoInst)
    {
        this.undo=undoInst
    }
    setEraserInstance(eraserInst)
    {
        this.eraser=eraserInst;
    }
    getPointerPosition(e)
    {
        let rc=canvasRect
        let mouseX= (e.clientX -rc.left)*dpr;
        let mouseY= (e.clientY -rc.top)*dpr;

        let worldX= this.zom.camX + mouseX/(this.zom.zoom*dpr);
        let worldY= this.zom.camY + mouseY/(this.zom.zoom*dpr);

        return {
            x:worldX,
            y:worldY,
            pressure: e.pressure ?? 0.5,
            type: e.pointerType
        }
    }
    catmullRom(p0, p1, p2, p3, t) {
        const v0 = (p2 - p0) * 0.5;
        const v1 = (p3 - p1) * 0.5;
        const t2 = t * t;
        const t3 = t * t2;
        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
    }
    screenToWorld(screenX, screenY) {
        return {
            x: this.zom.camX + screenX / (this.zom.zoom * dpr),
            y: this.zom.camY + screenY / (this.zom.zoom * dpr)
        };
    }
    onPointerDown(e) {
        this.drawing = true;
        const rc = canvasRect;
        // Record starting position in SCREEN pixels
        this.currentScreenPos = { 
            x: (e.clientX - rc.left) * dpr, 
            y: (e.clientY - rc.top) * dpr 
        };

        const worldPos = this.screenToWorld(this.currentScreenPos.x, this.currentScreenPos.y);
        this.points = [{ ...worldPos, pressure: e.pressure || 0.5 }];
        this.interpolatedPoints = [[worldPos.x, worldPos.y, e.pressure || 0.5]];
    }

    onPointerMove(e) {
        if (!this.drawing) return;

        const rc = canvasRect;
        const targetScreenX = (e.clientX - rc.left) * dpr;
        const targetScreenY = (e.clientY - rc.top) * dpr;

        const dx = targetScreenX - this.currentScreenPos.x;
        const dy = targetScreenY - this.currentScreenPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // ROPE LOGIC (Always feels the same size on screen)
        if (dist > this.ropeSize) {
            const angle = Math.atan2(dy, dx);
            const moveDist = dist - this.ropeSize;
            
            this.currentScreenPos.x += Math.cos(angle) * moveDist;
            this.currentScreenPos.y += Math.sin(angle) * moveDist;

            // Check SPACING in screen pixels
            const lastWorldPoint = this.points[this.points.length - 1];
            // Project last world point to screen to check distance
            const lastScreenX = (lastWorldPoint.x - this.zom.camX) * this.zom.zoom * dpr;
            const lastScreenY = (lastWorldPoint.y - this.zom.camY) * this.zom.zoom * dpr;
            
            const screenDist = Math.hypot(this.currentScreenPos.x - lastScreenX, this.currentScreenPos.y - lastScreenY);

            if (screenDist > this.spacing) {
                const worldPos = this.screenToWorld(this.currentScreenPos.x, this.currentScreenPos.y);
                const newPoint = { ...worldPos, pressure: e.pressure || 0.5 };
                this.points.push(newPoint);

                // CATMULL-ROM SMOOTHING
                if (this.points.length > 3) {
                    const pts = this.points.slice(-4);
                    for (let t = 0.25; t <= 1; t += 0.25) {
                        const ix = this.catmullRom(pts[0].x, pts[1].x, pts[2].x, pts[3].x, t);
                        const iy = this.catmullRom(pts[0].y, pts[1].y, pts[2].y, pts[3].y, t);
                        const ip = pts[1].pressure + (pts[2].pressure - pts[1].pressure) * t;
                        this.interpolatedPoints.push([ix, iy, ip]);
                    }
                } else {
                    this.interpolatedPoints.push([newPoint.x, newPoint.y, newPoint.pressure]);
                }
            }
        }
        this.zom.draw();
    }

    onPointerUp() {
        if (!this.interpolatedPoints.length) return;
        
        const zoomFactor = Math.max(1, this.zom.zoom);
        // Use the SMOOTHED points for the final stroke
        const stroke = getStroke(this.interpolatedPoints, {
            size: size.value / this.zom.zoom,
            thinning: 0.6,
            smoothing: 0.5,
            streamline: 0.5,
            simulatePressure: true // Better results with interpolation
        });

        this.strokes.push({ stroke, color: color.value, type:this.eraser.isEraser?'erase':'draw' });

        this.points = [];
        this.interpolatedPoints = [];
        this.drawing = false;
        this.zom.draw();
        if (this.undo) this.undo.push(stroke, color.value,this.eraser.isEraser);
    }
    
    clear()
    {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore()
        this.strokes=[];
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
    push(stroke, color,isEraser) {
        this.top++;
        this.stack.length = this.top;
        this.stack.push({ stroke, color,type:isEraser?'erase':'draw' });
    }

    undo() {
        if (this.top < 0) return;
        this.top--;
        this.draw.strokes = this.stack.slice(0, this.top+1);
        this.zom.draw();
    }

    redo() {
        if (this.top + 1 >= this.stack.length) return;
        this.top++;
        this.draw.strokes = this.stack.slice(0, this.top+1);
        this.zom.draw();
    }
    reset()
    {
        this.stack=[];
        this.top=-1;
    }
}
class Zoom
{
    constructor(drawInst)
    {
        this.ctx=ctx;
        this.zoom=0.001
        this.camX = -canvas.width / (2 * this.zoom);
        this.camY = -canvas.height / (2 * this.zoom);
        this.canvas=canvas;
        this.drawins=drawInst
        this.isPanning = false;
        this.lastPanX = 0;
        this.lastPanY = 0;
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
    startPan(clientX,clientY)
    {
        const rect = canvasRect;

        this.isPanning = true;
        this.lastPanX = (clientX - rect.left) * dpr;
        this.lastPanY = (clientY - rect.top) * dpr;
    }
    mousePan(clientX,clientY)
    {
        if(!this.isPanning)
        {
            return
        }
        const rect=canvasRect
        let mouseX=(clientX -rect.left) *dpr
        let mouseY=(clientY -rect.top) *dpr

        const dx=mouseX-this.lastPanX;
        const dy=mouseY-this.lastPanY;

        this.camX -= dx/this.zoom
        this.camY -= dy/this.zoom

        this.lastPanX=mouseX
        this.lastPanY=mouseY
        this.draw();
    }
    endPan()
    {
        this.isPanning=false;

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
            if (s.type === "erase") {
                this.ctx.fillStyle=bgColor.value;
            ctx.globalCompositeOperation = "destination-out";
            } else {
                ctx.globalCompositeOperation = "source-over";
                this.ctx.fillStyle = s.color;
            }
            this.drawStroke(s.stroke);
        }
        ctx.globalCompositeOperation = "source-over";
        if (this.drawins.interpolatedPoints.length > 1) {
            const liveStroke = getStroke(this.drawins.interpolatedPoints, {
                size: (size.value / this.zoom), // Size stays consistent in screen space
                thinning: 0.6,
                smoothing: 0.5,
                streamline: 0.5,
                simulatePressure: true, 
                last: true // Tells perfect-freehand to taper the end
            });
            if (this.drawins.eraser.isEraser) {
                this.ctx.fillStyle = bgColor.value;
            } else {
                this.ctx.fillStyle = color.value;
            }
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

    zooming(deltaY, mousePosX, mousePosY) {
        // Prevent zooming while actively drawing to maintain coordinate integrity
        if (this.drawins.drawing) return; 

        let zoomFactor = 1 + Math.abs(deltaY) * 0.001;
        let rc = canvasRect;
        let mouseX = (mousePosX - rc.left) * dpr;
        let mouseY = (mousePosY - rc.top) * dpr;

        let worldX = this.camX + mouseX / this.zoom;
        let worldY = this.camY + mouseY / this.zoom;

        if (deltaY > 0) {
            this.zoom = this.zoom / zoomFactor; // Adjusted for "natural" scroll
        } else {
            this.zoom = this.zoom * zoomFactor;
        } 

        this.camX = worldX - mouseX / this.zoom;
        this.camY = worldY - mouseY / this.zoom;

        this.draw();
    }
    zoomCenter(deltaY) {

        if (this.drawins.drawing) return;

        const zoomFactor = 1 + Math.abs(deltaY) * 0.001;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const worldX = this.camX + centerX / this.zoom;
        const worldY = this.camY + centerY / this.zoom;

        if (deltaY > 0) {
            this.zoom = this.zoom / zoomFactor;
        } else {
            this.zoom = this.zoom * zoomFactor;
        }

        this.camX = worldX - centerX / this.zoom;
        this.camY = worldY - centerY / this.zoom;

        this.draw();
    }
    zoomingTouch(newZoom,centerX,centerY)
    {
        if(this.drawins.drawing) return;

        let worldX=this.camX+centerX/this.zoom
        let worldY=this.camY+centerY/this.zoom

        this.zoom=newZoom;
        this.camX=worldX-centerX/this.zoom
        this.camY=worldY-centerY/this.zoom
        this.draw();
    }
}
const drawInst=new Draw()
const zom=new Zoom(drawInst);
const undoInst=new UndoStack(drawInst,zom)
drawInst.setUndoInstance(undoInst);
drawInst.zom=zom;


class Listener
{
    constructor()
    {
        this.zoomMode="mouse";
        this.touchZoom = {
            active: false,
            startDistance: 0,
            startZoom: 1,
            center: { x: 0, y: 0 }
        };
        this.touchListeners();
        this.panListener();
        this.init()
    }
    init()
    {
        undo.addEventListener("click", e=>{
            e.stopPropagation();
            e.preventDefault();
            if(e.target.textContent==="↶")
            {
                undoInst.undo()
            }
            else if(e.target.textContent==="↷")
            {
                undoInst.redo()
            }
        });

        canvas.addEventListener('wheel', (e)=>{
            e.preventDefault();
            if(this.zoomMode==="mouse")
            {
                zom.zooming(e.deltaY,e.clientX,e.clientY)
            }
            else
            {
                zom.zoomCenter(e.deltaY)
            }
        });

        bgColor.addEventListener('input', (e)=>{
            canvas.style.background=e.target.value;
            e.target.blur

        });
        clear_btn.addEventListener("click", ()=>{
            drawInst.clear();
            undoInst.reset();
        });

        options.forEach((btn, index) => {
          btn.addEventListener("click", () => {
        
            document.querySelector(".zoom-option.active").classList.remove("active");
            btn.classList.add("active");
            sliderZoom.style.transform = `translateX(${index * 100}%)`;
            this.zoomMode = btn.dataset.mode;
          });
        });

    }
    touchListeners()
    {
        canvas.addEventListener("touchstart", (e)=>{
            e.preventDefault()
            e.stopPropagation()
            if(e.touches.length===3)
            {
                drawInst.mode=drawInst.mode==="draw"?"pan":"draw"
                drawInst.drawing = false;
                drawInst.points = [];
                drawInst.interpolatedPoints = [];
                if(drawInst.pendingDraw){
                    clearTimeout(drawInst.pendingDraw);
                    drawInst.pendingDraw = null;
                }
                drawInst.isPinching = false;
                this.touchZoom.active=false;
                zom.endPan();
                return;
            }
            else if(e.touches.length===2 && drawInst.mode==="draw")
            {
                this.touchZoom.active=true; // means 2 touches
                const [t1,t2]=e.touches; // gettings 2 touch points

                this.touchZoom.startDistance=Math.hypot(t2.clientX-t1.clientX, t2.clientY-t1.clientY); 

                this.touchZoom.startZoom=zom.zoom;

                this.touchZoom.center={
                    x:(t1.clientX+t2.clientX)/2,
                    y:(t1.clientY+t2.clientY)/2
                };
            }
        })

        canvas.addEventListener("touchmove", (e)=>{
            if(this.touchZoom.active && e.touches.length===2)
            {
                e.preventDefault();

                const [t1,t2]=e.touches;

                let currentDistance=Math.hypot(t2.clientX-t1.clientX,t2.clientY-t1.clientY)

                const scale=currentDistance/this.touchZoom.startDistance;

                let newZoom=this.touchZoom.startZoom*scale

                zom.zoomingTouch(newZoom,this.touchZoom.center.x,this.touchZoom.center.y)
            }
        })

        canvas.addEventListener("touchend", (e)=>{
            if(e.touches.length<2)
            {
                this.touchZoom.active=false;
            }
        });
    }
    panListener()
    {
        let timer=null;
        window.addEventListener("keydown", (press)=>{
            if(press.code==="Space" && drawInst.mode!=="pan")
            {
                press.preventDefault();
                if(drawInst.drawing)
                {
                    clearTimeout(timer);
                    mode_container.classList.remove("hidden")
                    mode_change.textContent=drawInst.mode
                    timer=setTimeout(()=>{
                        mode_container.classList.add("hidden");
                    },1000)
                }
                else
                {
                    drawInst.mode="pan"
                    mode_change.textContent=drawInst.mode
                    canvas.style.cursor="grab"
                    clearTimeout(timer);
                    mode_container.classList.remove("hidden")
                }
            }
        })
        window.addEventListener("keyup", (press)=>{
            if(press.code==="Space")
            {
                drawInst.mode="draw"
                mode_change.textContent=drawInst.mode
                canvas.style.cursor="crosshair"
                timer=setTimeout(()=>{
                    mode_container.classList.add("hidden");
                },1000)
            }
        })
        canvas.addEventListener("pointerdown", (e)=>{
            if(drawInst.mode!=="pan") return;
            zom.startPan(e.clientX, e.clientY)
            canvas.style.cursor="grabbing"
        });
        canvas.addEventListener("pointermove", (e)=>{
            if(drawInst.mode!=="pan") return;
            zom.mousePan(e.clientX, e.clientY)
        });

        canvas.addEventListener("pointerup", ()=>{
            if(drawInst.mode!=="pan") return;
            canvas.style.cursor="grab"
            zom.endPan();
        })


        canvas.addEventListener("touchstart", (e)=>{
            if(drawInst.mode!=="pan" || e.touches.length!==1) return;
            const touch=e.touches[0]
            zom.startPan(touch.clientX, touch.clientY)
        });
        canvas.addEventListener("touchmove", (e)=>{
            if(drawInst.mode!=="pan" || e.touches.length!==1) return;
            e.preventDefault()
            const touch=e.touches[0]
            zom.mousePan(touch.clientX, touch.clientY)
        });

        canvas.addEventListener("touchend", ()=>{
            if(drawInst.mode!=="pan") return;
            zom.endPan();
        })
    }
}
new Listener()
class Eraser
{
    constructor()
    {
        this.isEraser=false;
        this.init();
    }
    init()
    {
        eraser.addEventListener('click', ()=>{
            this.isEraser=!this.isEraser;
            eraser.classList.toggle('active-mode', this.isEraser);
            zom.draw();
        })
    }
}
let erase=new Eraser();
drawInst.setEraserInstance(erase)