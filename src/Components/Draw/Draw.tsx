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
    const [color, setColor] = useState<string | null>(null)
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
        setClickCoord(null)
        if(clickCoord && (isRectangle || isArc)) setClickCoord([...clickCoord, [x,y]])
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
        if(canvas.current && ctx) ctx.clearRect(0, 0, canvas.current.width, canvas.current.width)
    }

    const Draw = (e: React.MouseEvent<HTMLElement>) =>{
        if(ctx) {
            ctx.lineWidth = 20
            if(isEraser) {
            ctx.fillStyle = "White";
            ctx.strokeStyle = "White"
            }
        }
        if( isMouseDown && canvas.current && ctx  && (isPencil || isEraser)){
            ctx.lineTo(e.clientX - canvas.current.offsetLeft, e.clientY - canvas.current.offsetTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(e.clientX - canvas.current.offsetLeft,e.clientY - canvas.current.offsetTop, 10,0, Math.PI * 2);
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(e.clientX - canvas.current.offsetLeft, e.clientY - canvas.current.offsetTop);
        }
        if(isRectangle && ctx && clickCoord?.length===2){
            clickCoord.sort((a: number[], b: number[]) => a[0] - b[0] || a[1] - b[1])
            let width: number = clickCoord[1][0] - clickCoord[0][0] 
            let height: number = clickCoord[1][1] - clickCoord[0][1] 
            ctx.beginPath()
            ctx.rect(clickCoord[0][0], clickCoord[0][1], width, height);
            ctx.fill();
            ctx.beginPath();
            setClickCoord(null)
        }
        if(isArc && ctx && clickCoord?.length===2){

            let dx: number = clickCoord[1][0] > clickCoord[0][0] ? clickCoord[1][0] - clickCoord[0][0] : clickCoord[0][0] - clickCoord[1][0]
            let dy: number = clickCoord[1][1] > clickCoord[0][1] ? clickCoord[1][1] - clickCoord[0][1] : clickCoord[0][1] - clickCoord[1][1]
            let radius: number = Math.sqrt(dx*dx+dy*dy)
            ctx.beginPath()
            ctx.arc(clickCoord[0][0], clickCoord[0][1], radius, 0, Math.PI * 2);
            ctx.fill();
             ctx.beginPath();
            setClickCoord(null)
        }
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
            ctx.fillStyle = `${color}`;
            ctx.strokeStyle = `${color}`;
        }
    }
    },[color,isEraser])
    return (
        <>
        <button onClick={() => changeStates(setIsPencil)}>Карандаш</button>
        <button onClick={() => changeStates(setIsEraser)}>Ластик</button>
        <button onClick={() => changeStates(setIsRectangle)}>Квадрат</button>
        <button onClick={() => changeStates(setIsArc)}>Круглик</button>
        <button onClick={clear}>Очитить</button>
        <input onChange={(value) => setColor(value.target.value)} type="color" className="ColorPicker"></input>
        <canvas onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={Draw} ref={canvas} className="canvas"></canvas>            
        </>
    );
};

export default Draw;