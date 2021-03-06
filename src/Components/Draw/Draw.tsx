import React, { MouseEvent, TouchEvent, useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../Redux/DrawReducer";
import { AppStateType } from "../../Redux/store";
import { history } from "../../Types/types";
import Tools from "../Tools/Tools";

const Draw: React.FC = () => {
    const dispatch = useDispatch();
    const canvas = useRef<HTMLCanvasElement>(null);
    const historyRef = useRef<history[] | null>(null);
    const ctx = canvas.current?.getContext("2d");
    const isPencil = useSelector((state: AppStateType) => state.DrawReducer.isPencil);
    const isEraser = useSelector((state: AppStateType) => state.DrawReducer.isEraser);
    const isRectangle = useSelector((state: AppStateType) => state.DrawReducer.isRectangle);
    const isArc = useSelector((state: AppStateType) => state.DrawReducer.isArc);
    const color = useSelector((state: AppStateType) => state.DrawReducer.color);
    const size = useSelector((state: AppStateType) => state.DrawReducer.size);
    const history = useSelector((state: AppStateType) => state.DrawReducer.history);
    const historyNext = useSelector((state: AppStateType) => state.DrawReducer.historyNext);
    const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    const [clickCoord, setClickCoord] = useState<number[][] | null>(null);
    historyRef.current = history;

    const mouseDown = (e: MouseEvent | TouchEvent) => {
        let clientX = 0;
        let clientY = 0;
        setIsMouseDown(true);
        if ("clientX" in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if ("touches" in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        if (canvas.current) coord(clientX - canvas.current.offsetLeft, clientY - canvas.current.offsetTop);
    };

    const mouseUp = (e: MouseEvent | TouchEvent) => {
        let clientX = 0;
        let clientY = 0;
        setIsMouseDown(false);
        setClickCoord(null);
        if ("clientX" in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if ("touches" in e) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }
        const newState: history[] = history.reverse();
        const indexLast: number = newState.findIndex((el) => el.type === "PENCIL");
        if (indexLast !== -1) newState[indexLast].added = true;
        dispatch(actions.setHistory(newState.reverse()));
        ctx?.beginPath();
        if (canvas.current) coord(clientX - canvas.current.offsetLeft, clientY - canvas.current.offsetTop);
    };

    const coord = (x: number, y: number) => {
        if (clickCoord && (isRectangle || isArc)) setClickCoord([...clickCoord, (clickCoord[1] = [x, y])]);
        else if (!clickCoord && (isRectangle || isArc)) setClickCoord([[x, y]]);
    };

    const clear = (withHistory: boolean = false) => {
        if (canvas.current) ctx?.clearRect(0, 0, canvas.current.width, canvas.current.height);
        setClickCoord(null);
        if (withHistory) dispatch(actions.setHistory([]));
    };

    const createRect = (PosX: number, posY: number, width: number, height: number) => {
        ctx?.beginPath();
        ctx?.rect(PosX, posY, width, height);
        ctx?.fill();
    };

    const createArc = (PosX: number, posY: number, radius: number) => {
        ctx?.beginPath();
        ctx?.arc(PosX, posY, radius, 0, Math.PI * 2);
        ctx?.fill();
    };

    const draw = (e: MouseEvent | TouchEvent) => {
        let widthRect: number | null = null,
            heightRect: number | null = null,
            radius: number | null = null,
            nowX: number | null = null,
            nowY: number | null = null,
            startX: number | null = null,
            startY: number | null = null,
            endX: number | null = null,
            endY: number | null = null;

        if (clickCoord && clickCoord.length >= 1) {
            startX = clickCoord[0][0];
            startY = clickCoord[0][1];
        }

        if (startX && startY && clickCoord && clickCoord.length >= 2) {
            endX = clickCoord[1][0];
            endY = clickCoord[1][1];
            const dx: number = endX > startX ? endX - startX : startX - endX;
            const dy: number = endY > startY ? endY - startY : startY - endY;
            widthRect = endX - startX;
            heightRect = endY - startY;
            radius = Math.sqrt(dx * dx + dy * dy);
        }

        if (canvas.current && "clientX" in e) {
            nowX = e.clientX - canvas.current.offsetLeft;
            nowY = e.clientY - canvas.current.offsetTop;
        } else if (canvas.current && "touches" in e) {
            nowX = e.touches[0].clientX - canvas.current.offsetLeft;
            nowY = e.touches[0].clientY - canvas.current.offsetTop;
        }

        if (isMouseDown && nowX && nowY && ctx && (isPencil || isEraser)) {
            ctx.lineTo(nowX, nowY);
            ctx.stroke();
            createArc(nowX, nowY, size / 2);
            ctx.beginPath();
            ctx.moveTo(nowX, nowY);
            dispatch(actions.addHistory({ type: "PENCIL", x: nowX, y: nowY, added: false, size: size, color }));
        }

        if (isMouseDown && startX && startY && nowX && nowY && clickCoord) {
            if (history.length > 0 && history[history.length - 1].added === false && (history[history.length - 1].type === "RECT" || history[history.length - 1].type === "ARC")) {
                history.splice(history.length - 1, 1);
                reDraw(history);
            }
            const newArray: number[][] = clickCoord.splice(1, 1);
            setClickCoord(newArray);
            setClickCoord([...clickCoord, (clickCoord[1] = [nowX, nowY])]);

            if (widthRect && heightRect && isRectangle) {
                dispatch(actions.addHistory({ type: "RECT", x: startX, y: startY, added: false, width: widthRect, height: heightRect, size, color }));

                createRect(startX, startY, widthRect, heightRect);
            } else if (isArc && radius) {
                dispatch(actions.addHistory({ type: "ARC", x: startX, y: startY, added: false, radius, size, color }));

                createArc(startX, startY, radius);
            }
        }

        if (isRectangle && !isMouseDown && widthRect && heightRect && startX && startY) {
            dispatch(actions.addHistory({ type: "RECT", x: startX, y: startY, added: true, width: widthRect, height: heightRect, size, color }));

            createRect(startX, startY, widthRect, heightRect);
            setClickCoord(null);
        }

        if (isArc && startX && startY && radius && !isMouseDown) {
            dispatch(actions.addHistory({ type: "ARC", x: startX, y: startY, added: true, radius, size, color }));

            createArc(startX, startY, radius);
            setClickCoord(null);
        }
    };

    const reDraw = (history: history[]) => {
        clear();
        if (!ctx) return;
        ctx.beginPath();
        history.forEach((el) => {
            ctx.fillStyle = el.color;
            ctx.strokeStyle = el.color;
            ctx.lineWidth = el.size;
            switch (el.type) {
                case "PENCIL":
                    ctx.lineTo(el.x, el.y);
                    ctx.stroke();
                    createArc(el.x, el.y, el.size / 2);
                    ctx.beginPath();
                    ctx.moveTo(el.x, el.y);
                    if (el.added) ctx.beginPath();
                    break;
                case "RECT":
                    if (el.width && el.height) createRect(el.x, el.y, el.width, el.height);
                    ctx.beginPath();
                    break;
                case "ARC":
                    if (el.radius) createArc(el.x, el.y, el.radius);
                    ctx.beginPath();
                    break;
                default:
                    break;
            }
        });
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
    };

    useEffect(() => {
        if (canvas.current) {
            canvas.current.width = 4000;
            canvas.current.height = 4000;
        }
    }, []);

    useEffect(() => {
        if (!ctx) return;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }, [color]);

    useEffect(() => {
        if (ctx) ctx.lineWidth = size;
    }, [size, ctx]);

    return (
        <>
            <Tools clear={clear} reDraw={reDraw} />

            <canvas
                onMouseDown={mouseDown}
                onMouseUp={mouseUp}
                onMouseMove={draw}
                onTouchMove={draw}
                onTouchEnd={mouseUp}
                onTouchStart={mouseDown}
                onMouseLeave={() => {
                    setIsMouseDown(false);
                    ctx?.beginPath();
                }}
                ref={canvas}
                className="canvas"
            ></canvas>
        </>
    );
};

export default Draw;
