import {Container, Graphics, Sprite, Text} from "pixi.js";

export class ParkZone{
    constructor(parkingList){
        this.parkingList = parkingList;
        this.parkLineShift = 20;
        this.parkingGap =  250;
        this.parkingSpace = new Container();
        this.parkingWidth =0;

    }
    drawParking(carPosition){
        this.parkingWidth =0;
        for (let parkingPlaces = 0; parkingPlaces <= this.parkingList?.length; parkingPlaces++) {
            const parkingShift= (parkingPlaces * this.parkingGap)
            const bottomShift = (window.innerHeight*0.7 - carPosition) ;
            const line= this.createParkLine(parkingShift,0,  this.parkLineShift,bottomShift);
            this.parkingWidth+=this.parkLineShift;
            this.parkingSpace.addChild(line);

            if(parkingPlaces!== this.parkingList?.length) {
                const slot =  this.parkingList[parkingPlaces]
                const asset = slot?.interactive?null:slot?.car?.frame
                this.parkingWidth+=this.parkingGap - this.parkLineShift;
                const zone = this.createParkingZone(
                    parkingShift+this.parkLineShift,
                    0,
                    this.parkingGap - this.parkLineShift,
                    bottomShift-this.parkLineShift*2,
                    slot.car.color,
                    asset
                );
                zone.parkingData = slot
                this.parkingSpace.addChild(zone);
            }
        }

    }
    createParkLine(x,y , width, height) {
        const line = new Graphics();
        line.roundRect(x, y-20, width, height,15)
            .fill(0xffffff);
        line.roundRect(x - 30 , height - width - 20, 80, 20,15)
            .fill(0xffffff);
        return line;
    }
    createParkingZone(x, y, width, height, color,asset) {
        const zone = new Container();
        const bg = new Graphics();
        bg.rect(0, 0, width, height);
        //bg.fill({ color: 0x000000, alpha: 0.3 });
        zone.addChild(bg);
        if(!!asset){
            const car = new Sprite(asset);
            car.anchor.set(0.5);
            car.scale.set(0.8);
            car.position.set(width / 2, height - (car.height/2)-20);
            zone.addChild(car);

        }else {
            const label = new Text({
                text: 'P',
                style: {
                    fill: color,
                    fontSize: 100,
                    fontWeight: 'bold'
                }
            });
            label.anchor.set(0.5);
            label.position.set(width / 2, height - 100);
            zone.addChild(label);
        }
        zone.position.set(x, y);
        return zone;
    }
    getHitParkingZone(point) {
        return this.parkingSpace.children.find(child => {
            if (!child?.parkingData) return false;
            const b = child.getBounds();
            return (
                point.x >= b.x &&
                point.x <= b.x + b.width &&
                point.y >= b.y &&
                point.y <= b.y + b.height
            );
        });
    }
}