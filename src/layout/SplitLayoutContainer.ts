import {AParentLayoutContainer} from './AParentLayoutContainer';
import {EOrientation, ILayoutContainer, ISize} from './interfaces';


export default class SplitLayoutContainer extends AParentLayoutContainer {
  private static readonly SEPARATOR = `<div data-layout="separator"/>`;
  private static readonly SEPARATOR_WIDTH = 5;

  readonly minChildCount = 2;

  private readonly _ratios: number[] = [];

  constructor(document: Document, name: string, private readonly orientation: EOrientation, ratio: number, child1: ILayoutContainer, child2: ILayoutContainer) {
    super(document, name);
    console.assert(orientation != null);
    this.node.dataset.layout = 'split';
    this.node.dataset.orientation = orientation === EOrientation.HORIZONTAL ? 'h' : 'v';

    this.node.addEventListener('mousedown', (evt) => {
      if (this.isSeparator(<HTMLElement>evt.target)) {
        //dragging
        const index = Math.floor(Array.from(this.node.children).indexOf(<HTMLElement>evt.target) / 2);
        this.enableDragging(index);
      }
    });

    this.push(child1);
    this._ratios.push(ratio);
    this.push(child2);
  }

  private isSeparator(elem: HTMLElement) {
    return elem.parentElement === this.node && elem.dataset.layout === 'separator';
  }

  private enableDragging(index: number) {
    const mouseMove = (evt: MouseEvent) => {
      const ratio = this.orientation === EOrientation.HORIZONTAL ? evt.x / this.node.offsetWidth : evt.y / this.node.offsetHeight;
      this.setRatio(index, ratio);
    };
    const disable = (evt: MouseEvent) => {
      this.node.removeEventListener('mousemove', mouseMove);
      this.node.removeEventListener('mouseout', disable);
      this.node.removeEventListener('mouseleave', disable);
    };
    this.node.addEventListener('mousemove', mouseMove);
    this.node.addEventListener('mouseout', mouseMove);
    this.node.addEventListener('mouseleave', mouseMove);
  }

  setRatio(index: number, ratio: number) {
    //TODO
    console.log(index, ratio);
  }

  get ratios() {
    return this._ratios.slice();
  }

  get minSize() {
    console.assert(this.length > 1);
    const padding = (this.length - 1) * SplitLayoutContainer.SEPARATOR_WIDTH;
    switch(this.orientation) {
      case EOrientation.HORIZONTAL:
        return <ISize>this._children.reduce((a, c) => {
          const cmin = c.minSize;
          return [a[0] + cmin[0], Math.max(a[1], cmin[1])];
        }, [padding, 0]);
      case EOrientation.VERTICAL: {
        return <ISize>this._children.reduce((a, c) => {
          const cmin = c.minSize;
          return [Math.max(a[0], cmin[0]), a[1] + cmin[1]];
        }, [padding, 0]);
      }
    }
  }

  push(child: ILayoutContainer) {
    if (this.length > 0) {
      this.node.insertAdjacentHTML('beforeend', SplitLayoutContainer.SEPARATOR);
    }
    this.node.appendChild(wrap(child));
    return super.push(child);
  }

  remove(child: ILayoutContainer) {
    const wrapper = child.node.parentElement;
    //in case of the first one use the next one since the next child is going to be the first one
    const separator = wrapper.previousElementSibling || wrapper.nextElementSibling;
    separator.remove();
    wrapper.remove();
    return super.remove(child);
  }
}

function wrap(child: ILayoutContainer) {
  const s = child.node.ownerDocument.createElement('section');
  s.appendChild(child.header);
  s.appendChild(child.node);
  return s;
}
