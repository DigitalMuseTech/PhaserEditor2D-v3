/// <reference path="./Control.ts"/>

namespace colibri.ui.controls {

    export enum PreloadResult {
        NOTHING_LOADED,
        RESOURCES_LOADED
    }

    export const DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;
    export const ICON_SIZE = DEVICE_PIXEL_RATIO > 1 ? 32 : 16;
    export const RENDER_ICON_SIZE = 16;

    export class Controls {

        private static _images: Map<string, IImage> = new Map();
        private static _applicationDragData: any[] = null;

        static adjustCanvasDPI(canvas: HTMLCanvasElement, widthHint = 1, heightHint = 1) {

            const dpr = window.devicePixelRatio || 1;

            if (dpr === 1) {

                return;
            }

            const rect = canvas.getBoundingClientRect();

            const width = rect.width === 0 ? widthHint : rect.width;
            const height = rect.height === 0 ? heightHint : rect.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            const ctx = canvas.getContext("2d");

            ctx.scale(dpr, dpr);

            return ctx;
        }

        static measureTextWidth(context: CanvasRenderingContext2D, label: string) {

            const measure = context.measureText(label);

            return measure.width * DEVICE_PIXEL_RATIO;
        }

        static setDragEventImage(e: DragEvent, render: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {

            let canvas = document.getElementById("__drag__canvas") as HTMLCanvasElement;

            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.setAttribute("id", "__drag__canvas");
                canvas.style.imageRendering = "crisp-edges";
                canvas.width = 64;
                canvas.height = 64;
                canvas.style.width = canvas.width + "px";
                canvas.style.height = canvas.height + "px";
                canvas.style.position = "fixed";
                canvas.style.left = -100 + "px";
                document.body.appendChild(canvas);
            }

            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            render(ctx, canvas.width, canvas.height);

            e.dataTransfer.setDragImage(canvas, 10, 10);
        }

        static getApplicationDragData() {
            return this._applicationDragData;
        }

        static getApplicationDragDataAndClean() {
            const data = this._applicationDragData;
            this._applicationDragData = null;
            return data;
        }

        static setApplicationDragData(data: any[]) {
            this._applicationDragData = data;
        }

        static async resolveAll(list: Array<Promise<PreloadResult>>): Promise<PreloadResult> {

            let result = PreloadResult.NOTHING_LOADED;

            for (const promise of list) {

                const result2 = await promise;

                if (result2 === PreloadResult.RESOURCES_LOADED) {
                    result = PreloadResult.RESOURCES_LOADED;
                }
            }

            return Promise.resolve(result);
        }

        static resolveResourceLoaded() {
            return Promise.resolve(PreloadResult.RESOURCES_LOADED);
        }

        static resolveNothingLoaded() {
            return Promise.resolve(PreloadResult.NOTHING_LOADED);
        }

        static getImage(url: string, id: string, appendVersion = true): IImage {

            if (Controls._images.has(id)) {
                return Controls._images.get(id);
            }

            if (appendVersion) {

                url += "?v=" + CACHE_VERSION;
            }

            const img = new DefaultImage(new Image(), url);

            Controls._images.set(id, img);

            return img;
        }

        static openUrlInNewPage(url: string) {

            const element = document.createElement("a");

            element.href = url;
            element.target = "blank";

            document.body.append(element);

            element.click();

            element.remove();
        }

        static LIGHT_THEME: ITheme = {
            id: "light",
            displayName: "Light",
            classList: ["light"],
            dark: false,
            viewerSelectionBackground: "#4242ff",
            viewerSelectionForeground: "#f0f0f0",
            viewerForeground: "#000000",
        };

        static DARK_THEME: ITheme = {
            id: "dark",
            displayName: "Dark",
            classList: ["dark"],
            dark: true,
            viewerSelectionBackground: "#f0a050", // "#101ea2",//"#8f8f8f",
            viewerSelectionForeground: "#0e0e0e",
            viewerForeground: "#f0f0f0",
        };

        static _theme: ITheme = Controls.DARK_THEME;

        static switchTheme(): ITheme {

            const newTheme = this._theme === this.LIGHT_THEME ? this.DARK_THEME : this.LIGHT_THEME;

            this.setTheme(newTheme);

            return newTheme;
        }

        static setTheme(theme: ITheme) {

            const classList = document.getElementsByTagName("html")[0].classList;

            classList.remove(...this._theme.classList);
            classList.add(...theme.classList);

            this._theme = theme;

            Platform.getWorkbench().eventThemeChanged.fire(this._theme);

            localStorage.setItem("colibri.theme.id", theme.id);
        }

        static preloadTheme() {

            let id = localStorage.getItem("colibri.theme.id");

            if (!id) {
                id = "light";
            }

            const classList = document.getElementsByTagName("html")[0].classList;
            classList.add(id);
        }

        static getTheme() {
            return this._theme;
        }

        static drawRoundedRect(
            ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
            topLeft = 5, topRight = 5, bottomRight = 5, bottomLeft = 5) {

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x + topLeft, y);
            ctx.lineTo(x + w - topRight, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + topRight);
            ctx.lineTo(x + w, y + h - bottomRight);
            ctx.quadraticCurveTo(x + w, y + h, x + w - bottomRight, y + h);
            ctx.lineTo(x + bottomLeft, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - bottomLeft);
            ctx.lineTo(x, y + topLeft);
            ctx.quadraticCurveTo(x, y, x + topLeft, y);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

    }
}