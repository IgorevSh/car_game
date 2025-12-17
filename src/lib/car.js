import {Sprite} from "pixi.js";

export class Car{
    constructor(data) {
        this.carData = data;
        this.car = this.initCar()
    }
    getCar(){
        return this.car;
    }
    initCar() {
        const car = new Sprite(this.carData.frame)
        car.scale.set(0.8)
        car.interactive = true;
        car.cursor = 'pointer';
        car.carData = this.carData;
        car.ready = false;
        car.eventMode = 'static';
        car.anchor.set(0.5);
        return car;
    }
}