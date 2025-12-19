import {Sprite} from "pixi.js";

export class Hint {
    constructor(app,handTexture) {
        this.handHintShown =true;
        this.handTexture = handTexture;
        this.handTimeout=null;
        this._app = app;
    }
    switchHand(val){
        this.handHintShown = val;
    }
     showHandHint(start, end,container) {

        const hand = new Sprite( this.handTexture);
        hand.anchor.set(0.5);

        hand.position.set(start.x, start.y);
        hand.startPosition =start;
        hand.alpha = 1;
        container.addChild(hand);
        const duration = 140;
        let step = 0;
        let timerSet =false;
        this._app.ticker.add( function handControl(){
            if(!this.handHintShown){
                this._app.ticker.remove(handControl);
                container.removeChild(hand);
                hand.destroy();
                clearTimeout(this.handTimeout);
                return;
            }
            function moveHand() {
                if (step >= duration) {
                    return
                }
                step++;

                const t = step / duration;

                hand.x = start.x + (end.x  - start.x) * t;
                hand.y = start.y + (end.y  - start.y) * t;

                if (t > 0.5) {
                    hand.alpha = 1 - (t - 0.5) * 2; // плавное исчезновение после половины пути
                }

            }
            if(step < duration) {
                moveHand();
            }else{
                if(!timerSet){
                    timerSet = true;
                    this.handTimeout=setTimeout(()=>{
                        if(hand) {
                            hand.x = hand.startPosition.x;
                            hand.y = hand.startPosition.y;
                            hand.alpha = 1;
                            step = 0;
                            timerSet = false;
                        }
                    },3000);
                }
            }
        }.bind(this));
    }
}