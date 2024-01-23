import { useState, useRef, createRef } from "react";
import { setGamePhase, socket, setPage } from "./redux/logicSlice"
import { useDispatch, useSelector } from "react-redux"
import "./Game.css"

let file, fileURL;
let image, drawImage;
let word;
let objects;
const cimagewidth = 1280;
const cimageheigth = 720;
const drawingCanvasWidth = 500
const drawingCanvasHeight = 500;
let isDrawing = false;
let drawCanvasForImage, finalCanvas;
let points;
let username;
let winners;
let vote_results;

const setWord = async e => {
    word = e.target.value;
}

var options = {
    color: 'black',
    size: 2,
    tool: 'pencil'
}

const minSize = 1, maxSize = 25;

let ctx;
let draw_ctx;
let cursor_ctx;
let drawDiv;
let vote_drawings;
let voteId;

function drawImageToOriginal(){
    const myImage = new Image();
    myImage.onload = () => {
        for(const mobject of objects){
            ctx.drawImage(myImage, mobject.x_min * cimagewidth, mobject.y_min * cimageheigth, (mobject.x_max - mobject.x_min) * cimagewidth, (mobject.y_max - mobject.y_min) * cimageheigth)
        }
    }
    myImage.src = drawCanvasForImage.toDataURL()
}

export default function Game(){
    const gamePhase = useSelector(state => state.gameState.gamePhase);
    const dispatch = useDispatch();
    const isAdmin = useSelector(state => state.gameState.isAdmin)
    const dialogRef = useRef([]);
    
    let [appareances, setAppareances] = useState({});

    const uploadImage = () => {
        socket.emit('upload image', {'file': file, 'fileURL': fileURL})
    }

    socket.on('your username', uname => {
        username = uname
    });

    socket.on('your word', w => word = w);

    socket.on('select word', (appareances) => {
        dispatch(setGamePhase('select word'));
        setAppareances(JSON.parse(appareances))
    });

    socket.on('draw', (payload) => {
        image = payload.image;
        word = payload.word;
        objects = payload.objects;
        dispatch(setGamePhase('draw'));
    })

    const setImage = async e => {
        const reader = new FileReader();

        reader.onload = () => {
            file = reader.result;
          };
        
        reader.readAsArrayBuffer(e.target.files[0])

        const reader2 = new FileReader();

        reader2.onload = () => {
            fileURL = reader2.result;
          };
        
        reader2.readAsDataURL(e.target.files[0])
    }

    const sendWord = () => {
        socket.emit('word selected', word);
        dispatch(setGamePhase('waiting for other players'));
    }

    socket.on('coop draw time', (payload) => {
        image = payload.image;
        objects = payload.objects;
        dispatch(setGamePhase('coop draw'));
    })

    socket.on('waiting for host', () => dispatch(setGamePhase('waiting for host')))

    if(gamePhase === 'waiting for host'){
        return <div className="formHolder"><p>Waiting for host to upload image</p></div>
    }

    if(gamePhase === 'upload image'){
    return <div className="formHolder">
        <label htmlFor="my_image">Upload image:</label>
        <br></br>
        <input type='file' name='my_image' accept=".jpg, .jpeg, .png" onChange={e => setImage(e)}></input>
        <button onClick={uploadImage}>Upload image</button>
        </div>
    }

    if(gamePhase === 'select word'){
        return <div className="formHolder">
            {Object.keys(appareances).map(key => <div key={"div" + key}><input type="radio" name='word' id={key} value={key} key={"input" + key} onChange={e => setWord(e)}/>
                                        <label htmlFor={key} key={"label" + key}>{key} - {appareances[key]}</label>
                                        <br key={"br" + key}/></div>)}
            <button onClick={sendWord}>Select word</button>
        </div>
    }

    if (gamePhase === 'waiting for other players'){
        return <div className="formHolder"><p>Waiting for other players!</p></div>
    }


    
    
    const activateDraw = (ref) => {
        if(!ref){
            return
        }
        finalCanvas = ref;
        ctx = ref.getContext('2d');
        // draw stuff
        const myImage = new Image();
        myImage.onload = function(){
            ctx.drawImage(myImage,0,0, cimagewidth, cimageheigth); // Or at whatever offset you like
            for(const object1 of objects){
                ctx.beginPath()
                ctx.fillStyle = "blue";
                ctx.clearRect(object1.x_min * cimagewidth, object1.y_min * cimageheigth, (object1.x_max - object1.x_min) * cimagewidth, (object1.y_max - object1.y_min) * cimageheigth)
                ctx.rect(object1.x_min * cimagewidth, object1.y_min * cimageheigth, (object1.x_max - object1.x_min) * cimagewidth, (object1.y_max - object1.y_min) * cimageheigth);
                ctx.stroke()
            }
        };
        myImage.src = image;
    }

    function setColor(color){
        options.color = color;
        draw_ctx.fillStyle = color;
        draw_ctx.strokeStyle = color;
    }

    const drawActivateDraw = (ref) => {
        if(!ref){
            return
        }
        draw_ctx = ref.getContext('2d');
        drawCanvasForImage = ref;
        setColor('black');
        draw_ctx.lineWidth = options.size * 2;
    }

    const cursorActivateDraw = (ref) => {
        if(!ref){
            return
        }
        cursor_ctx = ref.getContext('2d');
    }

    function getX(e){
        return Math.floor(e.pageX - drawCanvasForImage.getBoundingClientRect().left- 1);
    }
    
    function getY(e){
        return Math.floor(e.pageY  - drawCanvasForImage.getBoundingClientRect().top - 1);
    }

    const drawCursor = (e) => {
        cursor_ctx.clearRect(0, 0, drawingCanvasWidth, drawingCanvasHeight);
        cursor_ctx.beginPath();
        cursor_ctx.arc(getX(e), getY(e), options.size, 0, 2*Math.PI);
        cursor_ctx.stroke();
    }

    function scaleCursor(e){
        e.deltaY < 0 ? options.size++ : options.size--;
        options.size = Math.min(Math.max(options.size, minSize), maxSize);
        draw_ctx.lineWidth = options.size * 2;
        drawCursor(e);
    }

    function drawPencilStart(e){
        draw_ctx.beginPath();
        draw_ctx.arc(getX(e), getY(e), options.size, 0, 2*Math.PI);
        draw_ctx.fill();
        draw_ctx.beginPath();
        draw_ctx.moveTo(getX(e), getY(e));
        // cursorCanvas.addEventListener('mousemove', drawPencilMove);
        isDrawing = true;
        // drawImageToOriginal()
    }

    function drawPencilMove(e){
        if(!isDrawing){
            return;
        }

        draw_ctx.lineTo(getX(e), getY(e));
        draw_ctx.stroke();
        draw_ctx.beginPath();
        draw_ctx.arc(getX(e), getY(e), options.size, 0, 2*Math.PI);
        draw_ctx.fill();
        draw_ctx.beginPath();
        draw_ctx.moveTo(getX(e), getY(e));
        drawImageToOriginal()
    }

    const submitDrawing = () => {
        const file = finalCanvas.toDataURL();
        // socket.emit("XD", JSON.stringify({"file": file}));
        socket.emit('submit drawing', file);
        dispatch(setGamePhase('waiting for other players'));
    }

    const canvas = <canvas width={cimagewidth} height={cimageheigth} ref={e => activateDraw(e)} id="imageCanvas"/>
    const drawingCanvas = 
        (<span id = 'drawDiv' ref={e => drawDiv = e} >
            <div id = 'canvasHolder'>
                <canvas width={drawingCanvasWidth} height={drawingCanvasHeight} id='myCanvas' ref={e => drawActivateDraw(e)} ></canvas>
                <canvas width={drawingCanvasWidth} height={drawingCanvasHeight} id='cursorCanvas' onWheel={e => scaleCursor(e)} ref={e => cursorActivateDraw(e)} onMouseMove={e => {drawCursor(e); drawPencilMove(e)}} onMouseLeave={() => {cursor_ctx.clearRect(0, 0, 700, 700); isDrawing = false}} onMouseDown={e => drawPencilStart(e)} onMouseUp={() => isDrawing = false}></canvas>
            </div>
            <div id='colorButtonHolder'>
                <div className="colorButton" style={{"backgroundColor": "black"}} onClick={() => setColor('black')}></div>
                <div className="colorButton" style={{"backgroundColor": "white"}} onClick={() =>setColor('white')}></div>
                <div className="colorButton" style={{"backgroundColor": "blue"}} onClick={() =>setColor('blue')}></div>
                <div className="colorButton" style={{"backgroundColor": "red"}} onClick={() =>setColor('red')}></div>
                <div className="colorButton" style={{"backgroundColor": "lightskyblue"}} onClick={() =>setColor('lightskyblue')}></div>
                <div className="colorButton" style={{"backgroundColor": "yellow"}} onClick={() =>setColor('yellow')}></div>
                <div className="colorButton" style={{"backgroundColor": "pink"}} onClick={() =>setColor('pink')}></div>
                <div className="colorButton" style={{"backgroundColor": "brown"}} onClick={() =>setColor('brown')}></div>
                <div className="colorButton" style={{"backgroundColor": "magenta"}} onClick={() =>setColor('magenta')}></div>
                <div className="colorButton" style={{"backgroundColor": "lightblue"}} onClick={() =>setColor('lightblue')}></div>
                <div className="colorButton" style={{"backgroundColor": 'lightgreen'}} onClick={() =>setColor('lightgreen')}></div>
                <div className="colorButton" style={{"backgroundColor": 'lightslategray'}} onClick={() =>setColor('lightslategray')}></div>
                <div className="colorButton" style={{"backgroundColor": 'darkblue'}} onClick={() =>setColor('darkblue')}></div>
                <div className="colorButton" style={{"backgroundColor": 'darkgreen'}} onClick={() =>setColor('darkgreen')}></div>
                <div className="colorButton" style={{"backgroundColor": 'orange'}} onClick={() =>setColor('orange')}></div>
                <div className="colorButton" style={{"backgroundColor": 'purple'}} onClick={() =>setColor('purple')}></div>
                <div className="colorButton" style={{"backgroundColor": 'orangered'}} onClick={() =>setColor('orangered')}></div>
                <div className="colorButton" style={{"backgroundColor": 'indianred'}} onClick={() =>setColor('indianred')}></div>
            </div>
            <input type='file' name='my_image' accept=".jpg, .jpeg, .png" onChange={e => addPhoto(e)}></input>
            <button onClick={submitDrawing}>Submit drawing</button>
        </span>)

    const addPhoto = async (e) => {

        const reader = new FileReader();

        reader.onload = () => {
            drawImage = reader.result;
            const myImage = new Image();
            myImage.onload = () => {
                draw_ctx.drawImage(myImage, 0, 0, drawingCanvasWidth, drawingCanvasHeight)
                drawImageToOriginal();
            }
            myImage.src = drawImage;
        };
        
        reader.readAsDataURL(e.target.files[0]);
        
    }

    

    socket.on('vote', drawings => {
        vote_drawings = drawings;
        console.log('vote time')
        dispatch(setGamePhase('vote'));
    })

    if (gamePhase === 'draw'){
        return <div className="formHolder2">
            <p id="wordId">You should draw something instead of: {word}.</p>

            {canvas}
            {drawingCanvas}
            
        </div>
    }

    const submitVote = () => {
        socket.emit('vote', voteId);
    }

    socket.on('vote ok', () => {
        dispatch(setGamePhase('waiting for other players'));
    })

    socket.on('vote results', vote_res => {
        vote_results = vote_res;
        dispatch(setGamePhase('vote results'));
        console.log('vote results heheh');
    })

    if (gamePhase === 'vote'){
        
        if(dialogRef.current.length < vote_drawings.length){
            dialogRef.current = Array(vote_drawings.length)
            .fill()
            .map((_, i) => dialogRef.current[i] || createRef());
        }

        console.log(dialogRef, dialogRef.current)
        
        return <div className="formHolder">
            <div>
                {vote_drawings.map((dr, i) => <div className="imageHolder">
                    <dialog ref={el => dialogRef.current[i] = el}><img src={dr.drawing} alt=""/><br/><button onClick={() => dialogRef.current[i].close()}>Close</button></dialog>
                    <input type="radio" value={dr.UUID} name="vote" onChange={e => {voteId = e.target.value}}/>
                    <label htmlFor={dr.UUID} onClick={() => dialogRef.current[i].showModal()}><img src={dr.drawing} alt="" className="voteImage"/></label>
                </div>)}
            </div>
            <button onClick={submitVote}>Submit vote</button>
        </div>
    }

    socket.on('game end', w => {
        winners = w;
        dispatch(setGamePhase('game end'));
    })

    if (gamePhase === 'vote results'){
        let some_button;
        if (isAdmin){
            some_button = <button onClick={() => socket.emit('start next round')}>"Start next round"</button>
        } else {
            some_button = <button disabled>"Start next round"</button>
        }
        return <div className="formHolder">
            <ol>
                {vote_results.map(v => <li key = {"point" + v[0]}>{v[0]} - {v[1]}</li>)}
            </ol>
            {some_button}
        </div>
    }

    if(gamePhase === 'game end'){
        if(winners.length === 1){
            return <div className="formHolder">
                <p>Winner is: {winners[0]}</p>
                <button onClick={() => dispatch(setPage(''))}>Back to home page</button>
            </div>
        }
        else{
            return <div className="formHolder">
                <p>Winners are: {winners.join(", ")}</p>
                <button onClick={() => dispatch(setPage(''))}>Back to home page</button>
                </div>
        }
    }

    const activateDrawCoop = (ref) => {
        if(!ref){
            return
        }
        finalCanvas = ref;
        ctx = ref.getContext('2d');
        // draw stuff
        const myImage = new Image();
        myImage.onload = function(){
            ctx.drawImage(myImage,0,0, cimagewidth, cimageheigth); // Or at whatever offset you like
            for(const user in objects){
                const object1 = objects[user];
                ctx.beginPath()
                
                ctx.clearRect(object1.x_min * cimagewidth, object1.y_min * cimageheigth, (object1.x_max - object1.x_min) * cimagewidth, (object1.y_max - object1.y_min) * cimageheigth)
                if(user === username){
                    ctx.strokeStyle = "blue";
                    ctx.rect(object1.x_min * cimagewidth, object1.y_min * cimageheigth, (object1.x_max - object1.x_min) * cimagewidth, (object1.y_max - object1.y_min) * cimageheigth);
                }
                else{
                    ctx.strokeStyle = "black";
                    console.log(user, username)
                    ctx.rect(object1.x_min * cimagewidth, object1.y_min * cimageheigth, (object1.x_max - object1.x_min) * cimagewidth, (object1.y_max - object1.y_min) * cimageheigth);
                }
                ctx.stroke()
            }
        };
        myImage.src = image;
    }

    function drawPencilMoveCoop(e){
        if(!isDrawing){
            return;
        }

        draw_ctx.lineTo(getX(e), getY(e));
        draw_ctx.stroke();
        draw_ctx.beginPath();
        draw_ctx.arc(getX(e), getY(e), options.size, 0, 2*Math.PI);
        draw_ctx.fill();
        draw_ctx.beginPath();
        draw_ctx.moveTo(getX(e), getY(e));
        socket.emit('coop drawing move', drawCanvasForImage.toDataURL());
    }

    const addPhotoCoop = async (e) => {

        const reader = new FileReader();

        reader.onload = () => {
            drawImage = reader.result;
            const myImage = new Image();
            myImage.onload = () => {
                draw_ctx.drawImage(myImage, 0, 0, drawingCanvasWidth, drawingCanvasHeight)
                // drawImageToOriginal();
                socket.emit('coop drawing move', drawCanvasForImage.toDataURL());
            }
            myImage.src = drawImage;
        };
        
        reader.readAsDataURL(e.target.files[0]);
        
    }

    const submitDrawingCoop = () => {
        const file = finalCanvas.toDataURL();
        socket.emit('submit drawing coop', file);
    }

    socket.on('coop drawing move', payload => {
        const myImage = new Image();
        const mobject = objects[payload.user];
        myImage.onload = () => {
            ctx.drawImage(myImage, mobject.x_min * cimagewidth, mobject.y_min * cimageheigth, (mobject.x_max - mobject.x_min) * cimagewidth, (mobject.y_max - mobject.y_min) * cimageheigth)
        }
        myImage.src = payload.file
    });
    //COOP PART

    socket.on('coop ended', fileURL => {
        file = fileURL;
        dispatch(setGamePhase('coop ended'))
    });

    const canvas2 = <canvas width={cimagewidth} height={cimageheigth} ref={e => activateDrawCoop(e)} id="imageCanvas"/>
    const drawingCanvas2 = 
        (<span id = 'drawDiv' ref={e => drawDiv = e}>
            <div id = 'canvasHolder'>
                <canvas width={drawingCanvasWidth} height={drawingCanvasHeight} id='myCanvas' ref={e => drawActivateDraw(e)} ></canvas>
                <canvas width={drawingCanvasWidth} height={drawingCanvasHeight} id='cursorCanvas' onWheel={e => scaleCursor(e)} ref={e => cursorActivateDraw(e)} onMouseMove={e => {drawCursor(e); drawPencilMoveCoop(e)}} onMouseLeave={() => {cursor_ctx.clearRect(0, 0, 700, 700); isDrawing = false}} onMouseDown={e => drawPencilStart(e)} onMouseUp={() => isDrawing = false}></canvas>
            </div>
            <div id='colorButtonHolder'>
                <div className="colorButton" style={{"backgroundColor": "black"}} onClick={() => setColor('black')}></div>
                <div className="colorButton" style={{"backgroundColor": "white"}} onClick={() =>setColor('white')}></div>
                <div className="colorButton" style={{"backgroundColor": "blue"}} onClick={() =>setColor('blue')}></div>
                <div className="colorButton" style={{"backgroundColor": "red"}} onClick={() =>setColor('red')}></div>
                <div className="colorButton" style={{"backgroundColor": "lightskyblue"}} onClick={() =>setColor('lightskyblue')}></div>
                <div className="colorButton" style={{"backgroundColor": "yellow"}} onClick={() =>setColor('yellow')}></div>
                <div className="colorButton" style={{"backgroundColor": "pink"}} onClick={() =>setColor('pink')}></div>
                <div className="colorButton" style={{"backgroundColor": "brown"}} onClick={() =>setColor('brown')}></div>
                <div className="colorButton" style={{"backgroundColor": "magenta"}} onClick={() =>setColor('magenta')}></div>
                <div className="colorButton" style={{"backgroundColor": "lightblue"}} onClick={() =>setColor('lightblue')}></div>
                <div className="colorButton" style={{"backgroundColor": 'lightgreen'}} onClick={() =>setColor('lightgreen')}></div>
                <div className="colorButton" style={{"backgroundColor": 'lightslategray'}} onClick={() =>setColor('lightslategray')}></div>
                <div className="colorButton" style={{"backgroundColor": 'darkblue'}} onClick={() =>setColor('darkblue')}></div>
                <div className="colorButton" style={{"backgroundColor": 'darkgreen'}} onClick={() =>setColor('darkgreen')}></div>
                <div className="colorButton" style={{"backgroundColor": 'orange'}} onClick={() =>setColor('orange')}></div>
                <div className="colorButton" style={{"backgroundColor": 'purple'}} onClick={() =>setColor('purple')}></div>
                <div className="colorButton" style={{"backgroundColor": 'orangered'}} onClick={() =>setColor('orangered')}></div>
                <div className="colorButton" style={{"backgroundColor": 'indianred'}} onClick={() =>setColor('indianred')}></div>
            </div>
            <input type='file' name='my_image' accept=".jpg, .jpeg, .png" onChange={e => addPhotoCoop(e)}></input>
            <button onClick={submitDrawingCoop} disabled={!isAdmin}>Finish drawing</button>
        </span>)
    if(gamePhase === 'coop draw'){
        return <div className="formHolder2">
            <p>Your word is {word}! Draw it in the blue rect</p>
            {canvas2}
            {drawingCanvas2}
            
        </div>
    }

    if(gamePhase === 'coop ended'){
        return <div  className="formHolder">
            <img src={file} alt="drawn together"/><br/>
            <button onClick={() => dispatch(setPage(''))}>Back to home page</button>
        </div>
    }
}