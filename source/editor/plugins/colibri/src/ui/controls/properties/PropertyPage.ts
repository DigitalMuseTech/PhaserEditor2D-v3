namespace colibri.ui.controls.properties {

    class PropertySectionPane extends Control {

        private _section: PropertySection<any>;
        private _titleArea: HTMLDivElement;
        private _expandIconElement: HTMLCanvasElement;
        private _expandIconContext: CanvasRenderingContext2D;
        private _formArea: HTMLDivElement;
        private _page: PropertyPage;
        private _menuIcon: IconControl;
        private _menu: Menu;

        constructor(page: PropertyPage, section: PropertySection<any>) {
            super();

            this._page = page;

            this._section = section;

            this.addClass("PropertySectionPane");
        }

        setMenu(menu: Menu) {

            this._menu = menu;

            this._menuIcon.getCanvas().style.visibility = menu.isEmpty() ? "hidden" : "visible";
        }

        createSection() {

            if (!this._formArea) {

                this._titleArea = document.createElement("div");
                this._titleArea.classList.add("PropertyTitleArea");

                this._expandIconElement = document.createElement("canvas");

                this._expandIconElement.classList.add("expanded");

                this._expandIconElement.style.width =
                    (this._expandIconElement.width = controls.RENDER_ICON_SIZE) + "px";
                this._expandIconElement.style.height =
                    (this._expandIconElement.height = controls.RENDER_ICON_SIZE) + "px";

                controls.Controls.adjustCanvasDPI(
                    this._expandIconElement, controls.RENDER_ICON_SIZE, controls.RENDER_ICON_SIZE);

                this._expandIconElement.addEventListener("mouseup", () => this.toggleSection());

                this._titleArea.appendChild(this._expandIconElement);

                this._expandIconContext = this._expandIconElement.getContext("2d");
                this._expandIconContext.imageSmoothingEnabled = false;

                const label = document.createElement("label");
                label.innerText = this._section.getTitle();
                label.addEventListener("mouseup", () => this.toggleSection());
                this._titleArea.appendChild(label);

                this._menuIcon = new IconControl(ColibriPlugin.getInstance().getIcon(ICON_SMALL_MENU));
                this._menuIcon.getCanvas().classList.add("IconButton");
                this._menuIcon.getCanvas().style.visibility = "hidden";
                this._menuIcon.getCanvas().addEventListener("mousedown", e => {

                    if (this._menu) {

                        this._menu.createWithEvent(e);
                    }
                });
                this._titleArea.appendChild(this._menuIcon.getCanvas());

                this._formArea = document.createElement("div");
                this._formArea.classList.add("PropertyFormArea");
                this._section.create(this._formArea);

                this.getElement().appendChild(this._titleArea);
                this.getElement().appendChild(this._formArea);

                this.updateExpandIcon();

                let collapsed = this.getCollapsedStateInStorage();

                if (collapsed === undefined) {

                    this.setCollapsedStateInStorage(this._section.isCollapsedByDefault());

                    collapsed = this.getCollapsedStateInStorage();
                }

                if (collapsed === "true") {

                    this.toggleSection();
                }
            }
        }

        private getCollapsedStateInStorage() {

            return window.localStorage[this.getLocalStorageKey() + ".collapsed"];
        }

        private setCollapsedStateInStorage(collapsed: boolean) {

            return window.localStorage[this.getLocalStorageKey() + ".collapsed"] = collapsed ? "true" : "false";
        }

        private getLocalStorageKey() {

            return `colibri.ui.controls.properties.PropertySection[${this._section.getId()}]`;
        }


        isExpanded() {
            return this._expandIconElement.classList.contains("expanded");
        }

        private toggleSection(): void {

            if (this.isExpanded()) {

                this._formArea.style.display = "none";
                this._expandIconElement.classList.remove("expanded");

            } else {

                this._formArea.style.display = "grid";
                this._expandIconElement.classList.add("expanded");
            }

            this._page.updateExpandStatus();

            this.getContainer().dispatchLayoutEvent();

            this.updateExpandIcon();

            this.setCollapsedStateInStorage(!this.isExpanded());
        }

        private updateExpandIcon() {

            const size = controls.RENDER_ICON_SIZE;

            this._expandIconContext.clearRect(0, 0, size, size);

            const icon = this.isExpanded() ? colibri.ICON_CONTROL_TREE_COLLAPSE : colibri.ICON_CONTROL_TREE_EXPAND;
            const image = ColibriPlugin.getInstance().getIcon(icon);

            // controls.Controls.adjustCanvasDPI(this._expandIconElement);
            image.paint(this._expandIconContext, 0, 0, size, size, false);
        }

        getSection() {
            return this._section;
        }

        getFormArea() {
            return this._formArea;
        }
    }

    export class PropertyPage extends Control {
        private _sectionProvider: PropertySectionProvider;
        private _sectionPanes: PropertySectionPane[];
        private _sectionPaneMap: Map<string, PropertySectionPane>;
        private _selection: any[];

        constructor() {
            super("div");

            this.addClass("PropertyPage");

            this._sectionPanes = [];
            this._sectionPaneMap = new Map();
            this._selection = [];
        }

        private build() {

            if (this._sectionProvider) {

                const list: Array<PropertySection<any>> = [];

                this._sectionProvider.addSections(this, list);

                for (const section of list) {

                    if (!this._sectionPaneMap.has(section.getId())) {

                        const pane = new PropertySectionPane(this, section);

                        this.add(pane);

                        this._sectionPaneMap.set(section.getId(), pane);

                        this._sectionPanes.push(pane);
                    }
                }

                const sectionIdList = list.map(section => section.getId());

                for (const pane of this._sectionPanes) {
                    const index = sectionIdList.indexOf(pane.getSection().getId());
                    pane.getElement().style.order = index.toString();
                }

                this.updateWithSelection();

            } else {

                for (const pane of this._sectionPanes) {
                    pane.getElement().style.display = "none";
                }

            }
        }

        private updateWithSelection(): void {

            if (!this._sectionProvider) {
                return;
            }

            const list: Array<PropertySection<any>> = [];

            this._sectionProvider.addSections(this, list);

            const sectionIdSet = new Set<string>();

            for (const section of list) {
                sectionIdSet.add(section.getId());
            }

            let n = this._selection.length;

            let selection = this._selection;

            if (n === 0) {

                const obj = this._sectionProvider.getEmptySelectionObject();

                if (obj) {

                    selection = [obj];
                    n = 1;
                }
            }

            this._selection = selection;

            for (const pane of this._sectionPanes) {

                const section = pane.getSection();

                let show = false;

                if (section.canEditNumber(n)) {

                    show = true;

                    for (const obj of selection) {

                        if (!section.canEdit(obj, n)) {

                            show = false;
                            break;
                        }
                    }
                }

                show = show && sectionIdSet.has(section.getId());

                if (show) {

                    pane.getElement().style.display = "grid";
                    pane.createSection();
                    section.updateWithSelection();

                    const menu = new Menu();

                    section.createMenu(menu);

                    pane.setMenu(menu);

                } else {

                    pane.getElement().style.display = "none";
                }
            }

            this.updateExpandStatus();
        }

        updateExpandStatus() {

            const list: Array<PropertySection<any>> = [];

            this._sectionProvider.addSections(this, list);

            const sectionIdList = list.map(section => section.getId());

            const sortedPanes = this._sectionPanes
                .map(p => p)
                .sort((a, b) =>
                    sectionIdList.indexOf(a.getSection().getId()) - sectionIdList.indexOf(b.getSection().getId())
                );

            let templateRows = "";

            for (const pane of sortedPanes) {

                if (pane.style.display !== "none") {

                    pane.createSection();

                    if (pane.isExpanded()) {

                        templateRows += " " + (pane.getSection().isFillSpace() ? "1fr" : "min-content");

                    } else {

                        templateRows += " min-content";
                    }
                }

            }

            this.getElement().style.gridTemplateRows = templateRows + " ";
        }

        getSelection() {
            return this._selection;
        }

        setSelection(sel: any[]): any {

            this._selection = sel;

            this.updateWithSelection();
        }

        setSectionProvider(provider: PropertySectionProvider): void {

            this._sectionProvider = provider;

            this.build();
        }

        getSectionProvider() {
            return this._sectionProvider;
        }
    }

}