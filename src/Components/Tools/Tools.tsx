import React, { useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../../Redux/DrawReducer";
import { AppStateType } from "../../Redux/store";
import { history, tool } from "../../Types/types";
import pencil from "../../images/pencil.svg";
import eraser from "../../images/eraser.svg";
import nextPrev from "../../images/nextPrev.svg";
interface props {
    clear: (withHistory: boolean) => void;
    reDraw: (history: history[]) => void;
}
const Tools: React.FC<props> = ({ clear, reDraw }) => {
    const dispatch = useDispatch();
    const colorRef = useRef<HTMLInputElement>(null);
    const historyRef = useRef<history[] | null>(null);
    const historyNextRef = useRef<history[] | null>(null);
    const isPencil = useSelector((state: AppStateType) => state.DrawReducer.isPencil);
    const isEraser = useSelector((state: AppStateType) => state.DrawReducer.isEraser);
    const isRectangle = useSelector((state: AppStateType) => state.DrawReducer.isRectangle);
    const isArc = useSelector((state: AppStateType) => state.DrawReducer.isArc);
    const size = useSelector((state: AppStateType) => state.DrawReducer.size);
    const history = useSelector((state: AppStateType) => state.DrawReducer.history);
    const historyNext = useSelector((state: AppStateType) => state.DrawReducer.historyNext);
    historyRef.current = history;
    historyNextRef.current = historyNext;
    const backStep = (history: history[]) => {
        const index = history.reverse().findIndex((el: history, index: number) => el.added === true && index !== 0);
        const newHis = history.slice(index).reverse();
        history.reverse();
        reDraw(newHis);
        dispatch(actions.setHistory(newHis));
        if (index === -1) clear(true);
    };
    const nextStep = (history: history[], historyNext: history[]) => {
        const partHis = historyNext.slice(history.length);
        console.log(historyNext);
        let index = partHis.findIndex((el) => el.added === true);
        const newHis = historyNext.slice(history.length, history.length + index + 1);
        reDraw([...history, ...newHis]);
        dispatch(actions.setHistory([...history, ...newHis]));
    };
    const manipulHis = useCallback((e: KeyboardEvent) => {
        const history = historyRef.current;
        const historyNext = historyNextRef.current;
        const key = e.key.toLowerCase();
        if (e.ctrlKey && key === "z" && history && history.length !== 0) backStep(history);
        if (e.ctrlKey && key === "y" && history && historyNext && historyNext.length !== 0) nextStep(history, historyNext);
    }, []);

    const setActiveState = (tool: tool, color: string) => {
        dispatch(actions.switchTool(tool));
        dispatch(actions.changeColor(color));
    };
    useEffect(() => {
        document.addEventListener("keydown", manipulHis);
        return () => document.removeEventListener("keydown", manipulHis);
    }, []);
    return (
        <div className="tools">
            <div className="tools__wrapper">
                <button className="tools__button" onClick={() => setActiveState("PENCIL", colorRef.current?.value || "")} disabled={isPencil}>
                    <img src={pencil} alt="Карандаш" className="tools__img" />
                </button>
                <button className="tools__button" onClick={() => setActiveState("ERASER", "#ffffff")} disabled={isEraser}>
                    <img src={eraser} alt="Ластик" className="tools__img" />
                </button>
                <button className="tools__button tools__rect" onClick={() => setActiveState("RECT", colorRef.current?.value || "")} disabled={isRectangle}></button>
                <button className="tools__button tools__arc" onClick={() => setActiveState("ARC", colorRef.current?.value || "")} disabled={isArc}></button>

                <input className="tools__size" onChange={(value) => dispatch(actions.changeSize(+value.target.value))} type="range" min="2" max="40" step="1" value={size}></input>
                <input ref={colorRef} onChange={(value) => dispatch(actions.changeColor(value.target.value))} type="color" disabled={isEraser} className="tools__colorPicker" />
                <button className="tools__button tools__prev" onClick={() => backStep(history)} disabled={history.length === 0 && true}>
                    <img src={nextPrev} alt="назад" />
                </button>
                <button className="tools__button tools__next" onClick={() => nextStep(history, historyNext)} disabled={historyNext.length === 0 && true}>
                    <img src={nextPrev} alt="далее" />
                </button>
                <button className="tools__button tools__clear" onClick={() => clear(true)}>
                    Очиcтить
                </button>
            </div>
        </div>
    );
};

export default Tools;
