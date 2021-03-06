namespace phasereditor2d.scene.ui.sceneobjects {

    import json = core.json;
    import code = core.code;

    export interface IContainerData extends json.IObjectData {

        list: json.IObjectData[];
    }

    export class ContainerExtension extends SceneObjectExtension {

        private static _instance: ContainerExtension;

        static getInstance() {
            return this._instance || (this._instance = new ContainerExtension());
        }

        private constructor() {
            super({
                typeName: "Container",
                phaserTypeName: "Phaser.GameObjects.Container"
            });
        }

        getCodeDOMBuilder(): ObjectCodeDOMBuilder {

            return ContainerCodeDOMBuilder.getInstance();
        }

        async getAssetsFromObjectData(args: IGetAssetsFromObjectArgs) {

            const list = [];

            const children = args.serializer.read("list", []) as json.IObjectData[];

            for (const objData of children) {

                const ser = args.serializer.getSerializer(objData);

                const type = ser.getType();

                const ext = ScenePlugin.getInstance().getObjectExtensionByObjectType(type);

                if (ext) {

                    const list2 = await ext.getAssetsFromObjectData({
                        serializer: ser,
                        scene: args.scene,
                        finder: args.finder
                    });

                    list.push(...list2);
                }
            }

            return list;
        }

        createEmptySceneObject(args: ICreateEmptyArgs) {

            return this.createContainerObject(args.scene, 0, 0, []);
        }

        createSceneObjectWithData(args: ICreateWithDataArgs): sceneobjects.ISceneObject {

            const container = this.createContainerObject(args.scene, 0, 0, []);

            container.getEditorSupport().readJSON(args.data as IContainerData);

            return container;
        }

        private createContainerObject(scene: Scene, x: number, y: number, list: sceneobjects.ISceneObject[]) {

            const container = new sceneobjects.Container(scene, x, y, list);

            container.getEditorSupport().setScene(scene);

            scene.sys.displayList.add(container);

            return container;
        }

        createContainerObjectWithChildren(
            scene: Scene, objectList: sceneobjects.ISceneObject[]): sceneobjects.Container {

            const container = this.createContainerObject(scene, 0, 0, objectList);

            const name = scene.makeNewName("container");

            container.getEditorSupport().setLabel(name);

            return container;
        }

        acceptsDropData(data: any): boolean {
            return false;
        }

        createSceneObjectWithAsset(args: ICreateWithAssetArgs): sceneobjects.ISceneObject {
            return null;
        }
    }
}