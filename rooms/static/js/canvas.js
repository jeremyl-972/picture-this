class DrawableCanvasElement {
    constructor(canvasElementId, clearBtnId) {
        this.canvasElementId = canvasElementId;
        this.clearBtn = document.getElementById(clearBtnId);
        this.paintCanvas = document.getElementById(canvasElementId);
        this.paintContext = this.paintCanvas.getContext("2d");

        this.activeColor = "#9ACD32";
        this.dragging = false;
        this.cursorPoint = { x: 0, y: 0 };

        this.paintCanvas.onmousedown = (e) => { this.onMouseDownHandler(e); };
        this.paintCanvas.onmouseup = (e) => { this.onMouseUpHandler(e); };
        this.paintCanvas.onmouseout = (e) => { this.onMouseUpHandler(e); };
        this.paintCanvas.onmousemove = (e) => { this.onMouseMoveHandler(e); };
        this.clearBtn.onclick = (e) => { this.clearCanvas(e); };
                         
        const canvas = this.paintCanvas;

        document.body.addEventListener("touchstart", (e) => {
            if (e.target == canvas) {
                this.onMouseDownHandler(e); 
            }
        }, false);

        document.body.addEventListener("touchend", (e) => {
            if (e.target == canvas) { 
                this.onMouseUpHandler(e); 
            }
        }, false);
        
        document.body.addEventListener("touchmove", (e) => {
            if (e.target == canvas) { 
                this.onMouseMoveHandler(e); 
            }
        }, false);        
    }

    clearCanvas(whenPress) {
        const square = document.getElementById(this.canvasElementId);
        this.paintContext.clearRect(0, 0, square.width, square.height);
    }

    onMouseDownHandler(e) {
        document.getElementById(this.canvasElementId).style.cursor = "crosshair";

        this.dragging = true;
        const location = this.getLocationFrom(e);
        this.cursorPoint.x = location.x;
        this.cursorPoint.y = location.y;
    }

    onMouseMoveHandler(e) {
        document.getElementById(this.canvasElementId).style.cursor = "crosshair";
        if(!this.dragging) return;

        const location = this.getLocationFrom(e);
        this.drawing_line(this.activeColor, this.cursorPoint.x, this.cursorPoint.y, location.x, location.y, this.paintContext)
        this.cursorPoint.x = location.x;
        this.cursorPoint.y = location.y;
    }

    onMouseUpHandler(e) {
        this.dragging = false;
        document.getElementById(this.canvasElementId).style.cursor = "default";
    }

    drawing_line(color, x_start, y_start, x_end, y_end, board){
        board.strokeStyle = color;
        board.lineWidth = 1;
        board.beginPath();
        board.moveTo(x_start,y_start);
        board.lineTo(x_end,y_end);
        board.stroke(); 
        board.closePath();
    }

    getLocationFrom(e) {
        const location = { x: 0, y: 0 };

        if (e.constructor.name === "TouchEvent") {            
            const bounds = e.target.getBoundingClientRect();
            const touch = e.targetTouches[0];
            
            location.x = touch.pageX - bounds.left;
            location.y = touch.pageY - bounds.top;
        } else {            
            location.x = e.offsetX;
            location.y = e.offsetY;
        }

        return location;
    }

    toString() {
        return this.paintCanvas.toDataURL("image/png");
    }
};
// /////////////////////////////////////////////////////////////////////////////////////

const make_canvas = () => {
    const onClick = async (e) => {
        clearComponent();
        heading.innerText = 'The Waiting Place'
        setLoader();
        const canvas_url = e.currentTarget.value;
        await fetch(`/rooms/sent_sketch/${canvas_url}`).then(response => {
            response.json().then(data => {
                console.log(data);
                const node = document.createTextNode(data.message);
                const div = make__div("center-up-flex-column");
                div.appendChild(node);
                clearComponent();
                component.append(div);
            });
        });
    };
    const div = make__div("center-up-flex-column");
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');
    canvas.setAttribute('width', '300px');
    canvas.setAttribute('height', '350px');
    canvas.style.backgroundColor = "aliceblue";
    const canvas_url = 'some.url';
    btn = make_button(canvas_url, '', '', "Send", onClick);
    div.append(canvas, btn);
    heading.innerText = 'Start Drawing!'

    // const html = document.getElementsByTagName('html');
    // html.className = 'stop-scrolling';
    // const body = document.getElementsByTagName('body');
    // body.className = 'stop-scrolling';
    // console.log(body.className);
    return div;
};


