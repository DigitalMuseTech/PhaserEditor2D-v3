namespace phasereditor2d.scene.ui.sceneobjects {

    export class TileSpriteExtension extends BaseImageExtension {

        private static _instance = new TileSpriteExtension();

        static getInstance() {
            return this._instance;
        }

        constructor() {
            super({
                phaserTypeName: "Phaser.GameObjects.TileSprite",
                typeName: "TileSprite"
            });
        }

        adaptDataAfterTypeConversion(serializer: core.json.Serializer, originalObject: ISceneObject, extraData: any) {

            super.adaptDataAfterTypeConversion(serializer, originalObject, extraData);

            const obj = originalObject as unknown as Phaser.GameObjects.Components.ComputedSize;

            const width = obj.width === undefined ? 20 : obj.width;
            const height = obj.height === undefined ? 20 : obj.height;

            serializer.getData()[TileSpriteComponent.width.name] = width;
            serializer.getData()[TileSpriteComponent.height.name] = height;
        }

        getCodeDOMBuilder(): ObjectCodeDOMBuilder {

            return new TileSpriteCodeDOMBuilder();
        }

        protected newObject(scene: Scene, x: number, y: number, key?: string, frame?: string | number): ISceneObject {

            if (key) {

                return new TileSprite(scene, x, y, 0, 0, key, frame);
            }

            return new TileSprite(scene, x, y, 64, 64, null, null);
        }
    }
}