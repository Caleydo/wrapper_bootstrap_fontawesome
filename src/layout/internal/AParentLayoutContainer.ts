import {ILayoutContainer, ILayoutDump, ILayoutParentContainer, ISize} from '../interfaces';
import {ALayoutContainer, ILayoutContainerOption} from './ALayoutContainer';

export abstract class AParentLayoutContainer<T extends ILayoutContainerOption> extends ALayoutContainer<T> implements ILayoutParentContainer {
  parent: ILayoutParentContainer | null = null;
  readonly node: HTMLElement;
  abstract readonly minChildCount: number;
  protected readonly _children: ILayoutContainer[] = [];
  private _visible: boolean;

  constructor(document: Document, options: Partial<T>) {
    super(document, options);
    this.node = document.createElement('main');
    this.node.classList.add('phovea-layout');
  }

  get root(): ILayoutParentContainer {
    let p: ILayoutParentContainer = this;
    while(p.parent !== null) {
      p = p.parent;
    }
    return p;
  }

  forEach(callback: (child: ILayoutContainer, index: number) => void) {
    this._children.forEach(callback);
  }

  get children() {
    return this._children.slice();
  }

  [Symbol.iterator]() {
    return this._children[Symbol.iterator]();
  }

  get length() {
    return this._children.length;
  }

  get visible() {
    return this._visible;
  }

  set visible(visible: boolean) {
    if (this._visible === visible) {
      return;
    }
    this._visible = visible;
    this.visibilityChanged(visible);
  }

  protected visibilityChanged(visible: boolean): void {
    this.forEach((c) => c.visible = visible);
  }

  abstract get minSize(): ISize;

  push(child: ILayoutContainer) {
    if (child.parent) {
      child.parent.remove(child);
    }
    child.parent = this;
    this._children.push(child);
    return true;
  }

  remove(child: ILayoutContainer) {
    child.parent = null;
    this._children.splice(this._children.indexOf(child), 1);
    if (this.minChildCount > this.length && this.parent) {
      if (this.length > 0) {
        //remove and inline my children (just one since the remove will be called again
        this.parent.push(this._children[0]);
      } else {
        //remove me
        this.destroy();
      }
    }
    return true;
  }

  resized() {
    this.forEach((d) => d.resized());
  }

  destroy() {
    if (this.parent) {
      this.parent.remove(this);
    }
    this.forEach((d) => d.destroy());
  }

  persist(): ILayoutDump {
    return Object.assign(super.persist(), {
      children: this._children.map((d) => d.persist())
    });
  }

  find(id: number) {
    if (this.id === id) {
      return this;
    }
    for (const child of this._children) {
      const r = child.find(id);
      if (r != null) {
        return r;
      }
    }
    return null;
  };
}

export default AParentLayoutContainer;
