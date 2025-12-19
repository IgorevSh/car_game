import { Application, Assets, Container, Sprite , Graphics, Point} from 'pixi.js';
import {getLinesIntersection ,trimPathToIntersection, isInsideCarWithPadding} from './lib/utils.js'
import assetsBase64 from "./lib/assets.js";
import {ParkZone} from "./lib/parking.js";
import {Car} from "./lib/car.js";
import {ActiveCars} from "./lib/activeCars.js";
import {DrawZone} from "./lib/drawZone.js";
import {Hint} from "./lib/hint.js";
import {FinalScene} from "./lib/finalScene.js";

const INACTIVITY_DELAY = 20000;

const DEFAULT_WIDTH =1200;
const DEFAULT_HEIGHT = 900;
const CAR_SPEED = 3;
let CURRENT_SCALE_WIDTH = Math.min(window.innerWidth,DEFAULT_WIDTH)/DEFAULT_WIDTH;
let CURRENT_SCALE_HEIGHT = Math.min(window.innerHeight,DEFAULT_HEIGHT)/DEFAULT_HEIGHT;
let scale = Math.min(CURRENT_SCALE_HEIGHT,CURRENT_SCALE_WIDTH)
const handTexture = await Assets.load(assetsBase64.hand);
const failTexture = await Assets.load(assetsBase64.fail);
const iconTexture = await Assets.load(assetsBase64.logo);
const buttonTexture = await Assets.load(assetsBase64.button);
const cars_list = {
    GREEN:{
        color:0x00ff00,
        frame: await Assets.load(assetsBase64.cars.GREEN),
        name:'GREEN'
    },
    YELLOW:{
        color:0xffc841,
        frame:await Assets.load(assetsBase64.cars.YELLOW),
        name:'YELLOW'
    },
    RED:{
        color:0xd1191f,
        frame:await Assets.load(assetsBase64.cars.RED),
        name:'RED'
    },
    BLUE:{
        color:0x0000ff,
        frame:await Assets.load(assetsBase64.cars.BLUE),
        name:'BLUE'
    },

}
const parking_list = [
    {car:cars_list.GREEN,interactive: false },
    {car:cars_list.YELLOW, interactive: true},
    {car:cars_list.RED, interactive: true},
    {car:cars_list.BLUE,interactive: false},
]
let inactivityTimer = null;


(async () => {
    const app = new Application();
    await app.init({
        background: '#545454',
        resizeTo: window
    });
    document.body.appendChild(app.canvas);



    const container = new Container();
    app.stage.addChild(container);

    const PZ = new ParkZone(parking_list);
    const AC = new ActiveCars()
    const DZ = new DrawZone()
    const HC = new Hint(app,handTexture,scale)
    const FS = new FinalScene(app,buttonTexture,iconTexture,'https://roasup.com/');
    const drawZone  = DZ.zone;
    const parkingSpace =PZ.parkingSpace
    const redCar = new Car(cars_list.RED).getCar();
    const yellowCar =new Car(cars_list.YELLOW).getCar();
    AC.addSprites(redCar, yellowCar);

    setPositionOfCars();

    inactivityTimer = setTimeout(()=>{
        FS.showFinalScene(scale);
        HC.switchHand(false);
    },INACTIVITY_DELAY)

    let carsAreMoving = false;
    function startCarsMovement(intersection) {
        carsAreMoving = true;
        redCar.zIndex=1;
        yellowCar.zIndex=1;
        Object.values(DZ.savedPaths).forEach(pathData => {
            const carSprite =
                pathData.color === cars_list.RED.color ? redCar : yellowCar;

            pathData.movePoints = trimPathToIntersection(
                pathData.points,
                intersection
            );

            pathData.currentIndex = 0;
            pathData.car = carSprite;
        });
    }

    DZ.setOnPointerDown(AC,HC,inactivityTimer)
    DZ.setOnPointerMove(AC,PZ);
    DZ.setOnPointerUp(()=> {
            Object.values(DZ.savedPaths).forEach(pathData => {
                if (pathData && pathData.car) {
                    container.addChild(pathData.car);
                }
            });
            startCarsMovement(DZ.intersectionPoint);
    })

    function showFailAndFinalScene(){
        const failSprite = new Sprite(failTexture);
        failSprite.anchor.set(0.5);
        failSprite.position.set(app.screen.width/2, app.screen.height/2);
        failSprite.alpha = 0;
        failSprite.zIndex = 2;
        failSprite.interactive = false;
        failSprite.buttonMode = false;
        container.addChild(failSprite);
        let step = 0;
        const totalSteps = 60;
        app.ticker.add(function animateFail(){
            step++;
            const t = step/totalSteps;
            failSprite.alpha = t;
            failSprite.scale.set(0.5*t*scale);
            if(step>=totalSteps){
                app.ticker.remove(animateFail);
                setTimeout(()=>{
                    container.removeChild(failSprite);
                    failSprite.destroy();
                    FS.showFinalScene(scale);
                },1000);
            }
        });
    }
    PZ.drawParking(redCar.height);

    const redParking = parkingSpace?.children[5];
    container.addChild(parkingSpace);
    parkingSpace.position.set(window.innerWidth/2 - (parkingSpace.width-40)/2,0);
    container.addChild(redCar,yellowCar);
    container.addChild(drawZone);
    checkResize();
    if (redParking) {
        const endPos = redParking.toGlobal(new Point(redParking.width , redParking.height ));
        HC.showHandHint(redCar.toGlobal(new Point(redCar.width/2 , redCar.height/2 )), endPos,container,app);
    }
    app.ticker.add(() => {
      if (!carsAreMoving) return;
        const redPath = DZ.savedPaths.RED;
        const yellowPath = DZ.savedPaths.YELLOW;
        if (!redPath || !yellowPath) return;
        const redCarSprite = redPath.car;
        const yellowCarSprite = yellowPath.car;

        // Функция проверки пересечения спрайтов
        function isColliding(a, b) {
            const ab = a.getBounds();
            const bb = b.getBounds();
            return !(
                ab.x + ab.width-20 < bb.x ||
                ab.x > bb.x + bb.width-20 ||
                ab.y + ab.height-20 < bb.y ||
                ab.y > bb.y + bb.height-20
            );
        }

        if (isColliding(redCarSprite, yellowCarSprite)) {
            carsAreMoving = false;
            showFailAndFinalScene();
            return;
        }

        const totalSteps = Math.max(
            redPath.movePoints.length - redPath.currentIndex,
            yellowPath.movePoints.length - yellowPath.currentIndex
        );

        const redSpeed = ((redPath.movePoints.length - redPath.currentIndex) / totalSteps) * CAR_SPEED;
        const yellowSpeed = ((yellowPath.movePoints.length - yellowPath.currentIndex) / totalSteps) * CAR_SPEED;


        if (redPath.currentIndex < redPath.movePoints.length) {
            const target = redPath.movePoints[redPath.currentIndex];
            const dx = target.x - redCarSprite.x;
            const dy = target.y - redCarSprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= redSpeed) {
                redCarSprite.position.set(target.x, target.y);
                redPath.currentIndex++;
            } else {
                redCarSprite.x += (dx / dist) * redSpeed;
                redCarSprite.y += (dy / dist) * redSpeed;
            }
        }


        if (yellowPath.currentIndex < yellowPath.movePoints.length) {
            const target = yellowPath.movePoints[yellowPath.currentIndex];
            const dx = target.x - yellowCarSprite.x;
            const dy = target.y - yellowCarSprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= yellowSpeed) {
                yellowCarSprite.position.set(target.x, target.y);
                yellowPath.currentIndex++;
            } else {
                yellowCarSprite.x += (dx / dist) * yellowSpeed;
                yellowCarSprite.y += (dy / dist) * yellowSpeed;
            }

        }

        if (
            redPath.currentIndex >= redPath.movePoints.length &&
            yellowPath.currentIndex >= yellowPath.movePoints.length
        ) {
            carsAreMoving = false;
        }
    });


    function setPositionOfCars(){
        redCar.position.set(window.innerWidth/2 -redCar.width - 40, window.innerHeight-redCar.height/2);
        yellowCar.position.set(window.innerWidth/2 + yellowCar.width + 40, window.innerHeight-yellowCar.height/2);
    }
    function checkResize(){

        CURRENT_SCALE_WIDTH = Math.min(window.innerWidth,DEFAULT_WIDTH)/DEFAULT_WIDTH;
        CURRENT_SCALE_HEIGHT = Math.min(window.innerHeight,DEFAULT_HEIGHT)/DEFAULT_HEIGHT;
        scale = Math.min(CURRENT_SCALE_HEIGHT,CURRENT_SCALE_WIDTH)
        parkingSpace.scale.set(scale);
        parkingSpace.position.set(window.innerWidth/2 - (parkingSpace.width-40)/2,0)
        redCar.scale.set(scale);
        yellowCar.scale.set(scale);
        setPositionOfCars();
        //drawZone.scale.set(1/scale);
        DZ.updateHitArea();

    }
   // window.addEventListener("resize", checkResize, false);
})();


