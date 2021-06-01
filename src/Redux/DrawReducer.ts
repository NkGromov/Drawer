import { history, tool } from "../Types/types";
import { InferActionsTypes } from "./store";

const initialState = {
    isPencil: true,
    isEraser: false,
    isRectangle: false,
    isArc: false,
    color: "#000000",
    size: 20,
    history: [] as history[],
};

export type initialStateDraw = typeof initialState;

const DrawReducer = (state = initialState, action: ActionsTypes): initialStateDraw => {
    switch (action.type) {
        case "DRAW_SWITCH_TOOL":
            let isPencil = false;
            let isEraser = false;
            let isRectangle = false;
            let isArc = false;
            if (action.typeTool === "PENCIL") isPencil = true;
            else if (action.typeTool === "ERASER") isEraser = true;
            else if (action.typeTool === "RECT") isRectangle = true;
            else if (action.typeTool === "ARC") isArc = true;
            return { ...state, isPencil, isEraser, isRectangle, isArc };
        case "DRAW_CHANGE_SIZE":
            return { ...state, size: action.size };
        case "DRAW_CHANGE_COLOR":
            return { ...state, color: action.color };
        case "DRAW_ADD_HISTORY":
            return { ...state, history: [...state.history, action.history] };
        case "DRAW_SET_HISTORY":
            return { ...state, history: [...action.history] };
        default:
            return state;
    }
};

type ActionsTypes = InferActionsTypes<typeof actions>;

export const actions = {
    switchTool: (typeTool: tool) => ({ type: "DRAW_SWITCH_TOOL", typeTool } as const),
    changeSize: (size: number) => ({ type: "DRAW_CHANGE_SIZE", size } as const),
    changeColor: (color: string) => ({ type: "DRAW_CHANGE_COLOR", color } as const),
    addHistory: (history: history) => ({ type: "DRAW_ADD_HISTORY", history } as const),
    setHistory: (history: history[]) => ({ type: "DRAW_SET_HISTORY", history } as const),
};

export default DrawReducer;
