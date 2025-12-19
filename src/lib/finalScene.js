import {Container, Graphics, Sprite} from "pixi.js";

export class FinalScene {
constructor(app,buttonTexture,iconTexture,link) {
    this._app = app;
    this.buttonTexture = buttonTexture;
    this.iconTexture = iconTexture;
    this.link = link;
}
    showFinalScene(scale) {
        const finalContainer = new Container();
        this._app.stage.addChild(finalContainer);
        finalContainer.interactive = true;
        finalContainer.buttonMode = false;
        const bg = new Graphics();
        bg.rect(0, 0,  this._app.screen.width,  this._app.screen.height).fill({color:0x000000, alpha:0.5});
        finalContainer.addChild(bg);

        const icon = new Sprite(this.iconTexture);
        icon.anchor.set(0.5 ,0);
        icon.scale.set(0.3*scale);
        icon.position.set( this._app.screen.width / 2, 50); // 100 px от верхнего края
        finalContainer.addChild(icon);
        const button = new Sprite( this.buttonTexture);
        button.anchor.set(0.5);
        button.cursor = 'pointer';
        button.position.set( this._app.screen.width / 2,  this._app.screen.height - 100);
        button.scale.set(scale);
        button.interactive = true;
        button.buttonMode = true;

        button.on('pointerdown', () => {
            window.open( this.link,'_blank');
        });

        finalContainer.addChild(button);
    }
}