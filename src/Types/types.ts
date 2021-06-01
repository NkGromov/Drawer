export type tool = "PENCIL" | "ERASER" | "ARC" | "RECT";
export interface history {
    type: tool;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    added: boolean;
    size: number;
    color: string;
}
