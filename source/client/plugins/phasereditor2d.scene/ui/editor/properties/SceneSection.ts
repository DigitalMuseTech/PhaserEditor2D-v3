namespace phasereditor2d.scene.ui.editor.properties {

    export abstract class SceneSection extends BaseSceneSection<Scene> {

        protected getScene() {

            return this.getSelection()[0];
        }

        canEdit(obj: any, n: number): boolean {

            return obj instanceof Scene;
        }

        canEditNumber(n: number): boolean {

            return n === 1;
        }

        protected getSettings() {

            return this.getScene().getSettings();
        }

        getHelp(key: string) {

            return "TODO";
        }

        createStringField(comp: HTMLElement, name: string, label: string, tooltip: string) {

            const labelElement = this.createLabel(comp, label, tooltip);

            const textElement = this.createText(comp);

            this.addUpdater(() => {

                textElement.value = this.getSettings()[name].toString();
            });

            textElement.addEventListener("change", e => {

                const editor = this.getEditor();

                editor.getUndoManager().add(new ChangeSettingsPropertyOperation({
                    editor: editor,
                    name: name,
                    value: textElement.value,
                    repaint: true
                }));
            });

            return {
                label: labelElement,
                text: textElement
            };
        }

        createIntegerField(comp: HTMLElement, name: string, label: string, tooltip: string) {

            const labelElement = this.createLabel(comp, label, tooltip);

            const textElement = this.createText(comp);

            this.addUpdater(() => {

                textElement.value = this.getSettings()[name].toString();
            });

            textElement.addEventListener("change", e => {

                const editor = this.getEditor();

                editor.getUndoManager().add(new ChangeSettingsPropertyOperation({
                    editor: editor,
                    name: name,
                    value: Number.parseInt(textElement.value, 10),
                    repaint: true
                }));
            });

            return {
                label: labelElement,
                text: textElement
            };
        }

        createMenuField(
            comp: HTMLElement,
            items: Array<{ name: string, value: any }>,
            name: string, label: string, tooltip: string) {

            this.createLabel(comp, label, tooltip);

            const btn = this.createMenuButton(comp, "-", items, value => {

                const editor = this.getEditor();

                editor.getUndoManager().add(new ChangeSettingsPropertyOperation({
                    editor: editor,
                    name: name,
                    value: value,
                    repaint: true
                }));
            });

            this.addUpdater(() => {

                const item = items.find(i => i.value === this.getSettings().compilerOutputLanguage);

                btn.textContent = item ? item.name : "-";
            });
        }

        createBooleanField(comp: HTMLElement, name: string, label: string, tooltip: string) {

            const comp2 = document.createElement("div");
            comp2.classList.add("formGrid");
            comp2.style.gridTemplateColumns = "auto 1fr";

            comp.appendChild(comp2);

            const checkElement = this.createCheckbox(comp2);

            const labelElement = this.createLabel(comp2, label, tooltip);

            this.addUpdater(() => {

                checkElement.checked = this.getSettings()[name] as boolean;
            });

            checkElement.addEventListener("change", e => {

                const editor = this.getEditor();

                editor.getUndoManager().add(new ChangeSettingsPropertyOperation({
                    editor: editor,
                    name: name,
                    value: checkElement.checked,
                    repaint: true
                }));
            });

            return {
                comp: comp2,
                label: labelElement,
                check: checkElement
            };
        }
    }
}