import {Container, Graphics, Point, Rectangle} from "pixi.js";
import {getLinesIntersection, isInsideCarWithPadding} from "./utils.js";
const BRUSH_RADIUS = 16;
const BRUSH_STEP = BRUSH_RADIUS / 2;
export class DrawZone {
    constructor() {
        this.savedPaths = {
            RED: null,
            YELLOW: null
        };
        this.zone = new Graphics();
        this.drawing = null;
        this.linesContainer = new Container();
        this.activeCar = null;
        this.activeColor =null;
        this.finishedInZone = false;
        this.isDrawing = false;
        this.points = [];
        this.leftCarArea = false;
        this.intersectionPoint = null;
        this.initZone();
    }
    initZone(){
        this.drawing = new Graphics();
        this.drawing.rect(0,0,window.innerWidth,window.innerHeight).fill({color:0xff0000,alpha: 0.1})
        this.currentLine = new Graphics();
        this.zone.eventMode = 'dynamic';
        this.zone.hitArea = new Rectangle(0,0,window.innerWidth,window.innerHeight);
        this.zone.cursor = 'default';
        this.zone.addChild(this.drawing);
        this.startPoint = null;
        //this.addEvents();
    }
    updateHitArea(){
        this.savedPaths = {
            RED: null,
            YELLOW: null
        };
        this.zone.removeChild(this.drawing);
        this.drawing =null;
        this.initZone();
    }
    setOnPointerDown(AC,HC,FS){
        this.zone.on('pointerdown', (event)=>{

        const pos = event.global.clone();

        const hitCar = AC.getHitCar(pos);
        if (!hitCar||this.savedPaths[hitCar.carData.name]) {return;}
            HC.switchHand();
        //handHintShown=false;
        clearTimeout(FS);
        this.activeCar = hitCar;
        this.activeColor = hitCar.carData.color;
        this.currentBrushColor = this.activeColor;
        this.isDrawing = true;
        this.finishedInZone = false;
        this.points = [];
        this.leftCarArea = false;

        this.currentLine = new Graphics();
        this.zone.addChild(this.currentLine);

        this.startPoint = new Point(this.activeCar.x, this.activeCar.y);
        });
    }
    setOnPointerMove(AC,PZ){
        this.zone.on('pointermove', (event)=>{
        if (!this.isDrawing || !this.currentLine) return;

        const pos = event.global.clone();
        if (!this.leftCarArea) {
            if (isInsideCarWithPadding(this.activeCar, pos, 20)) {
                return;
            }
            this.leftCarArea = true;

            this.points.push({ x: pos.x, y: pos.y });
            return;
        }
        const last = this.points[this.points.length - 1];
        const hitOtherCar = AC.getHitCar(pos);

        if (hitOtherCar  && hitOtherCar !== this.activeCar) {
            this.currentLine.destroy();
            this.resetDrawing();
            return;
        }

        const hitZone = PZ.getHitParkingZone(pos);

        if (hitZone) {
            const { interactive, car } = hitZone.parkingData;

            if (interactive && car.color === this.activeColor) {
                this.linesContainer.addChild(this.currentLine);

                this.savedPaths[this.activeCar.carData.name] = {
                    points: [...this.points],
                    color: this.currentBrushColor,
                    graphics: this.currentLine
                };

            } else {
                this.currentLine.destroy();
            }

            this.resetDrawing();
            return;
        }

        const dx = pos.x - last.x;
        const dy = pos.y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.min(20, Math.ceil(dist / BRUSH_STEP));

        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = last.x + dx * t;
            const y = last.y + dy * t;

            this.currentLine
                .circle(x, y, BRUSH_RADIUS*(Math.min(window.innerWidth,1200)/1200))
                .fill({ color: this.currentBrushColor });
        }

        this.points.push(pos);

        const otherCarName =
            this.activeCar.carData.name === 'RED' ? 'YELLOW' : 'RED';

        const otherPath = this.savedPaths[otherCarName];

        if (otherPath) {
            const intersection = getLinesIntersection(
                otherPath.points,
                this.points
            );

            if (intersection) {
                this.intersectionPoint = intersection;
            }
        }
    })}
    setOnPointerUp(fn){
        this.zone.on('pointerup', (event)=>{
        const isSecondLine =
            Object.values(this.savedPaths).filter(Boolean).length === 2;
        if(isSecondLine&&this.intersectionPoint){
            fn();
            this.intersectionPoint =null;
        }
        // if (isSecondLine&&intersectionPoint) {
        //     Object.values(savedPaths).forEach(pathData => {
        //         if (pathData && pathData.car) {
        //             container.addChild(pathData.car); // машина над линией
        //         }
        //     });
        //     startCarsMovement(intersectionPoint);
        //     intersectionPoint =null;
        // }
        if (!this.isDrawing) return;

        if (this.currentLine) {
            this.currentLine.destroy();
        }

        this.resetDrawing();

    })}
    resetDrawing() {
        this.isDrawing = false;
        this.finishedInZone = false;
        this.points = [];
        this.currentLine = null;
        this.activeCar = null;
        this.activeColor = null;
    }
}