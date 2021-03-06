namespace phasereditor2d.pack.core {

    import controls = colibri.ui.controls;
    import ide = colibri.ui.ide;
    import core = colibri.core;

    export class PackFinder {

        private _packs: AssetPack[];

        constructor(...packs: AssetPack[]) {

            this._packs = packs.filter(pack => pack !== null && pack !== undefined);
        }

        async preload(monitor?: controls.IProgressMonitor): Promise<controls.PreloadResult> {

            let result = controls.PreloadResult.NOTHING_LOADED;

            this._packs = await AssetPackUtils.getAllPacks();

            const items = this._packs.flatMap(pack => pack.getItems());

            for (const item of items) {

                const result2 = await item.preload();
                result = Math.max(result, result2);

                if (monitor) {

                    monitor.step();
                }
            }

            return Promise.resolve(result);
        }

        getPacks() {
            return this._packs;
        }

        findAssetPackItem(key: string) {

            if (!key) {
                return null;
            }

            return this._packs
                .flatMap(pack => pack.getItems())
                .find(item => item.getKey() === key);
        }

        findPackItemOrFrameWithKey(key: string) {

            for (const pack of this._packs) {

                for (const item of pack.getItems()) {

                    if (item.getKey() === key) {
                        return item;
                    }

                    if (item instanceof ImageFrameContainerAssetPackItem) {

                        for (const frame of item.getFrames()) {

                            if (frame.getName() === key) {
                                return frame;
                            }
                        }
                    }
                }
            }

            return null;
        }

        getAssetPackItemOrFrame(key: string, frame: any) {

            const item = this.findAssetPackItem(key);

            if (!item) {
                return null;
            }

            if (item.getType() === IMAGE_TYPE) {

                if (frame === null || frame === undefined) {
                    return item;
                }

                return null;

            } else if (item instanceof ImageFrameContainerAssetPackItem) {

                const imageFrame = item.findFrame(frame);

                return imageFrame;
            }

            return item;
        }

        getAssetPackItemImage(key: string, frame: any): AssetPackImageFrame {

            const asset = this.getAssetPackItemOrFrame(key, frame);

            if (asset instanceof ImageAssetPackItem) {

                return asset.getFrames()[0];

            } else if (asset instanceof AssetPackImageFrame) {

                return asset;

            }

            return null;
        }

        async findPacksFor(file: core.io.FilePath) {

            const packs = new Set<AssetPack>();

            for (const pack of this.getPacks()) {

                for (const item of pack.getItems()) {

                    await item.preload();
                }

                const files = pack.computeUsedFiles();

                if (files.has(file)) {

                    packs.add(pack);
                }
            }

            return packs;
        }
    }
}