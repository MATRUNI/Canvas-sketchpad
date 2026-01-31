/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
ctx.strokeStyle="black"  // brush's color
ctx.lineWidth=2     // brush size
ctx.lineCap="square"    // something like brush type
ctx.lineJoin="round"
class Draw
{
    constructor()
    {
        this.drawing=false;
        this.lastx=0;
        this.lasty=0;
        this.init();
    }
    init()
    {
        canvas.addEventListener("mousedown", (e)=> this.onMouseDown(e));
        canvas.addEventListener("mousemove", (e)=> this.onMouseMove(e));
        canvas.addEventListener("mouseup",()=> this.onMouseUp());
    }
    getMousePosition(e)
    {
        let rc=canvas.getBoundingClientRect()
        return {
            x:e.clientX - rc.left,
            y:e.clientY - rc.top
        }
    }
    onMouseDown(e)
    {
        this.drawing=true;
        const {x,y}=this.getMousePosition(e)
        this.lastx=x
        this.lasty=y
        ctx.beginPath();    // begin 
        ctx.moveTo(x, y)    // from here
    }
    onMouseMove(e)
    {
        if(!this.drawing)
            return;

        const {x,y}=this.getMousePosition(e)
        let midX=(this.lastx+x)/2
        let midY=(this.lasty+y)/2   // these mid points for smoother lines
        ctx.quadraticCurveTo(this.lastx, this.lasty, midX, midY)
        ctx.stroke();   // to this position

        this.lastx=x;
        this.lasty=y;
    }
    onMouseUp()
    {
        this.drawing=false;
    }
}
new Draw()
console.log(canvas.width, canvas.height);
