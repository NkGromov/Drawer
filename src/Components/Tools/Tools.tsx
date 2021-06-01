import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { actions } from "../../Redux/DrawReducer";
import { AppStateType } from "../../Redux/store";
import { tool } from "../../Types/types";
import pencil from "../../images/pencil.svg";
import eraser from "../../images/eraser.svg";
interface props {
    clear: (withHistory: boolean) => void;
}
const Tools: React.FC<props> = ({ clear }) => {
    const dispatch = useDispatch();
    const colorRef = useRef<HTMLInputElement>(null);
    const isPencil = useSelector((state: AppStateType) => state.DrawReducer.isPencil);
    const isEraser = useSelector((state: AppStateType) => state.DrawReducer.isEraser);
    const isRectangle = useSelector((state: AppStateType) => state.DrawReducer.isRectangle);
    const isArc = useSelector((state: AppStateType) => state.DrawReducer.isArc);
    const color = useSelector((state: AppStateType) => state.DrawReducer.color);
    const size = useSelector((state: AppStateType) => state.DrawReducer.size);

    const setActiveState = (tool: tool, color: string) => {
        dispatch(actions.switchTool(tool));
        dispatch(actions.changeColor(color));
    };

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
                <button className="tools__button tools__clear" onClick={() => clear(true)}>
                    Очиcтить
                </button>
            </div>
        </div>
    );
};

export default Tools;
