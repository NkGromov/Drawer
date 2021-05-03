import React, {  Dispatch, SetStateAction, useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

interface history {
    type: "PENCIL" | "ERASER" | "ARC" | "RECT"
    x: number
    y: number
    width?: number
    height?: number
    radius?: number
    added: boolean
    size: number
    color: string
}

const Draw: React.FC = () => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const ctx = canvas.current?.getContext('2d')
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
    const [isPencil, setIsPencil] = useState<boolean>(false)
    const [isEraser, setIsEraser] = useState<boolean>(false)
    const [isRectangle, setIsRectangle] = useState<boolean>(false)
    const [isArc, setIsArc] = useState<boolean>(false)
    const [clickCoord, setClickCoord] = useState<number[][] | null>(null)
    const [color, setColor] = useState<string>("Black")
    const [size, setSize] = useState<number>(20)
    const [history, setHistory] = useState<history[] | null>(null)

    const mouseDown = (e: React.MouseEvent<HTMLElement>) => {
        setIsMouseDown(true)
        if(canvas.current) coord(e.clientX - canvas.current.offsetLeft,e.clientY- canvas.current.offsetTop)
    }

    const mouseUp = (e: React.MouseEvent<HTMLElement>) => {
        setIsMouseDown(false); 
        setClickCoord(null)
        ctx?.beginPath();
        if(canvas.current) coord(e.clientX - canvas.current.offsetLeft,e.clientY- canvas.current.offsetTop)
    }

    const coord = (x: number,y:number) =>{
        if(clickCoord && (isRectangle || isArc)) setClickCoord([...clickCoord, clickCoord[1] = [x,y]])
        else if(!clickCoord && (isRectangle || isArc)) setClickCoord([[x,y]])   
    }

    const changeStates = (state: Dispatch<SetStateAction<boolean>>)=>{
        setIsEraser(false)
        setIsPencil(false)
        setIsRectangle(false)
        setIsArc(false)
        state(true)
    }

    const clear = () =>{
        if(canvas.current && ctx) ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)
        setClickCoord(null)
        setHistory(null)
    }

    const createRect = (PosX: number, posY: number, width: number,height: number) =>{
        ctx?.beginPath()
        ctx?.rect(PosX, posY, width, height);
        ctx?.fill();
    }

    const createArc = (PosX: number, posY: number, radius: number) =>{
        ctx?.beginPath()
        ctx?.arc(PosX, posY, radius, 0, Math.PI * 2);
        ctx?.fill();
    }

    const addHistory = (param: history) =>{

        switch (param.type) {
            case "PENCIL" || "ERASER":
                if(history) setHistory([...history, {type: param.type, x: param.x, y: param.y, added: param.added, size: param.size, color: param.color}])
                else setHistory([{type: param.type, x: param.x, y: param.y, added: param.added, size: param.size, color: param.color}])
                break;
            case "RECT":
                if(history) setHistory([...history, {type: param.type, x: param.x, y: param.y, width: param.width, height: param.height, added: param.added, size: param.size, color: param.color}])
                else setHistory([{type: param.type, x: param.x, y: param.y, width: param.width, height: param.height,added: param.added, size: param.size, color: param.color}])
                break;
            case "ARC":
                if(history) setHistory([...history, {type: param.type, x: param.x, y: param.y, radius: param.radius,added: param.added, size: param.size, color: param.color}])
                else setHistory([{type: param.type, x: param.x, y: param.y, radius: param.radius,added: param.added,size: param.size, color: param.color}])
                break;
        
            default:
                break;
        }
     
    }

    const draw = (e: React.MouseEvent<HTMLElement>) =>{
        let widthRect: number | null = null
        let heightRect: number | null = null
        let radius: number | null = null
        let nowX: number | null = null
        let nowY: number | null = null
        let startX: number | null = null
        let startY: number | null = null
        let endX: number | null = null
        let endY: number | null = null

        if(clickCoord && clickCoord.length >= 1){
            startX = clickCoord[0][0]
            startY = clickCoord[0][1]
        }

        if(startX && startY && clickCoord && clickCoord.length >= 2){
            endX = clickCoord[1][0]
            endY = clickCoord[1][1]
            const dx: number = endX > startX ? endX- startX : startX - endX
            const dy: number = endY > startY ? endY - startY : startY - endY
            widthRect = endX - startX
            heightRect = endY - startY
            radius = Math.sqrt(dx*dx+dy*dy)
        }
        
        if(canvas.current){
            nowX = e.clientX - canvas.current.offsetLeft
            nowY = e.clientY - canvas.current.offsetTop
        }

        if(isMouseDown && nowX && nowY && ctx  && (isPencil || isEraser)){
            ctx.lineTo(nowX, nowY)
            ctx.stroke();
            createArc(nowX,nowY, size/1.9)
            ctx.beginPath()
            ctx.moveTo(nowX, nowY);
            addHistory({type: "PENCIL", x: nowX,y: nowY,added: true, size: size, color})
        }

        if(isMouseDown && startX && startY && nowX && nowY && clickCoord ){
            if (history && (history[history.length-1].type === "RECT" || history[history.length-1].type === "ARC") && history[history.length-1].added===false ) {
                const newHistory = history.splice(history.length-1,1)
                setHistory(newHistory)
                reDraw(history)
            }
                const newArray: number[][] = clickCoord.splice(1,1)
                setClickCoord(newArray)
                setClickCoord([...clickCoord, clickCoord[1] = [nowX, nowY]])
                
            if(widthRect && heightRect && isRectangle){
                addHistory({type: "RECT", x: startX, y: startY, added: false, width: widthRect, height: heightRect, size, color})
                createRect(startX , startY , widthRect , heightRect)
            }
            else if(isArc && radius){
                addHistory({type: "ARC", x: startX, y: startY, added: false, radius, size, color})
                createArc(startX, startY, radius)
            }
        }

        if(isRectangle  && !isMouseDown && widthRect && heightRect && startX && startY) {
            addHistory({type: "RECT", x: startX, y: startY, added: true, width: widthRect, height: heightRect, size, color})
            createRect(startX , startY , widthRect , heightRect)
            setClickCoord(null)
        }
      
        if(isArc && startX && startY && radius  && !isMouseDown) {
            addHistory({type: "ARC", x: startX, y: startY, added: true, radius, size, color})
            createArc(startX, startY, radius)
            setClickCoord(null)
        }
        
    }

    const reDraw = (history: history[]) => {
        clear()
        history.forEach((el)=>{
            if(ctx){
                ctx.fillStyle = el.color;
                ctx.strokeStyle = el.color;
                ctx.lineWidth = el.size
                switch (el.type) {
                    case "PENCIL" || "ERASER": 
                        ctx.lineTo(el.x, el.y)
                        ctx.stroke();
                        createArc(el.x, el.y, size/1.9)
                        ctx.beginPath()
                        ctx.moveTo(el.x, el.y);
                        break;
                    case "RECT": 
                        if(el.width && el.height) createRect(el.x,el.y, el.width, el.height)
                        ctx.beginPath()
                        break;
                    case "ARC": 
                        if(el.radius) createArc(el.x,el.y, el.radius)
                        ctx.beginPath()
                        break;
                    default:
                        break;
                }
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                ctx.lineWidth = size
            }
        })

    }

    useEffect(()=>{
        changeStates(setIsPencil)
        if(canvas.current) {
            canvas.current.width = window.innerWidth;
            canvas.current.height = window.innerHeight;
        }
    },[ window.innerWidth ,window.innerHeight])
    useEffect(()=>{
        if(ctx){
        if(isEraser){
            ctx.fillStyle = 'White';
            ctx.strokeStyle = 'White';
        }else {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
        }
    }
    },[color,isEraser])

    useEffect(()=>{
        if(ctx) ctx.lineWidth = size
    },[size,ctx])
    return (
        <>
        <button onClick={() => changeStates(setIsPencil)}>Карандаш</button>
        <button onClick={() => changeStates(setIsEraser)}>Ластик</button>
        <button onClick={() => changeStates(setIsRectangle)}>Квадрат</button>
        <button onClick={() => changeStates(setIsArc)}>Круглик</button>
        <button onClick={clear}>Очитить</button>
        <input onChange={(value) => setColor(value.target.value)} type="color" className="ColorPicker"></input>
        <input onChange={(value) => setSize(+value.target.value)} type="range"  min="2" max="40" step="1" value={size}></input>
        <canvas onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={draw} onMouseLeave={()=>{setIsMouseDown(false);  ctx?.beginPath();}} ref={canvas} className="canvas"></canvas>            
        </>
    );
};

export default Draw;