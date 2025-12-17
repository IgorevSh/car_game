export class ActiveCars {
    constructor() {
        this.carsSprites=[]
    }
    addSprites(...sprites) {
        this.carsSprites.push(...sprites);
    }
    getHitCar(point) {
        return this.carsSprites.find(car => {
            const b = car.getBounds();
            return (
                point.x >= b.x &&
                point.x <= b.x + b.width + 10 &&
                point.y >= b.y &&
                point.y <= b.y + b.height + 10
            );
        });
    }
}