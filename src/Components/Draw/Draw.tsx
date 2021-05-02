import React, {  Dispatch, SetStateAction, useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';



const Draw: React.FC = () => {
    let canvas = useRef<HTMLCanvasElement>(null)
    const ctx = canvas.current?.getContext('2d')
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
    const [isPencil, setIsPencil] = useState<boolean>(false)
    const [isEraser, setIsEraser] = useState<boolean>(false)
    const [isRectangle, setIsRectangle] = useState<boolean>(false)
    const [isArc, setIsArc] = useState<boolean>(false)
    const [clickCoord, setClickCoord] = useState<number[][] | null>(null)
    const [color, setColor] = useState<string>("Black")
    const [size, setSize] = useState<number>(10)

    const mouseDown = (e: React.MouseEvent<HTMLElement>) => {
        setIsMouseDown(true)
        if(canvas.current) coord(e.clientX - canvas.current.offsetLeft,e.clientY- canvas.current.offsetTop)
    }
    const mouseUp = (e: React.MouseEvent<HTMLElement>) => {
        setIsMouseDown(false); 
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
    }

    const calcRectParam = (coordsArray: number[][]) =>{
        const width: number = coordsArray[1][0] - coordsArray[0][0] 
        const height: number = coordsArray[1][1] - coordsArray[0][1] 
        createRect(coordsArray[0][0],coordsArray[0][1], width, height)
    }

    const createRect = (PosX: number, posY: number, width: number,height: number) =>{
        ctx?.beginPath()
        ctx?.rect(PosX, posY, width, height);
        ctx?.fill();
    }

    const calcArcParam = (coordsArray: number[][]) =>{
        const dx: number = coordsArray[1][0] > coordsArray[0][0] ? coordsArray[1][0] - coordsArray[0][0] : coordsArray[0][0] - coordsArray[1][0]
        const dy: number = coordsArray[1][1] > coordsArray[0][1] ? coordsArray[1][1] - coordsArray[0][1] : coordsArray[0][1] - coordsArray[1][1]
        const radius: number = Math.sqrt(dx*dx+dy*dy)
        createArc(coordsArray[0][0],coordsArray[0][1],radius)
    }

    const createArc = (PosX: number, posY: number, radius: number) =>{
        ctx?.beginPath()
        ctx?.arc(PosX, posY, radius, 0, Math.PI * 2);
        ctx?.fill();
    }

    const Draw = (e: React.MouseEvent<HTMLElement>) =>{
        if(isMouseDown && canvas.current && ctx  && (isPencil || isEraser)){
            ctx.lineTo(e.clientX - canvas.current.offsetLeft, e.clientY - canvas.current.offsetTop)
            ctx.stroke();
            createArc(e.clientX - canvas.current.offsetLeft,e.clientY - canvas.current.offsetTop, size/2)
            ctx.beginPath()
            ctx.moveTo(e.clientX - canvas.current.offsetLeft, e.clientY - canvas.current.offsetTop);
        }

        if(isMouseDown && canvas.current && ctx  && clickCoord && (isRectangle || isArc)){
            if(clickCoord.length === 2){
                const prevWidth: number = clickCoord[1][0] - clickCoord[0][0] 
                const prevHeight: number = clickCoord[1][1] - clickCoord[0][1] 
                ctx.clearRect(clickCoord[0][0], clickCoord[0][1], prevWidth, prevHeight)
            }
            const newArray = clickCoord.splice(1,1)
            setClickCoord(newArray)
            setClickCoord([...clickCoord, clickCoord[1] = [e.clientX - canvas.current.offsetLeft, e.clientY - canvas.current.offsetTop]])
            if(isRectangle) calcRectParam(clickCoord)
            else if (isArc)  calcArcParam(clickCoord)
          
        }

        if(isRectangle && ctx && clickCoord?.length === 2 && !isMouseDown) calcRectParam(clickCoord)
        
        if(isArc && ctx && clickCoord?.length===2 && !isMouseDown) calcArcParam(clickCoord)
        
    }
    useEffect(()=>{
        if(!isMouseDown) setClickCoord(null)
    },[isMouseDown])
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
            ctx.fillStyle = `${color}`;
            ctx.strokeStyle = `${color}`;
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
        <canvas onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={Draw} onMouseLeave={()=>{setIsMouseDown(false);  ctx?.beginPath();}} ref={canvas} className="canvas"></canvas>            
        </>
    );
};

export default Draw;