/**
 * Created by Samuel Gratzl on 01.08.2017.
 */
import {ALayoutContainer} from './ALayoutContainer';
import {ILayoutContainer} from 'phovea_ui/src/layout';
import TabbingLayoutContainer from './TabbingLayoutContainer';
import SplitLayoutContainer from './SplitLayoutContainer';
import {EOrientation, IDropArea} from '../interfaces';
import {dropAble} from 'phovea_core/src/internal/dnd';


function determineDropArea(x: number, y: number): IDropArea {
  if (x < 0.3) {
    return 'left';
  }
  if (x > 0.7) {
    return 'right';
  }
  if (y < 0.3) {
    return 'top';
  }
  if (y > 0.7) {
    return 'bottom';
  }
  return 'center';
}

export function dropViews(node: HTMLElement, reference: ALayoutContainer<any> & ILayoutContainer) {
  node.dataset.drop = 'center';
  dropAble(node, [ALayoutContainer.MIME_TYPE], (result, e) => {
    const area = determineDropArea(e.offsetX / node.offsetWidth, e.offsetY / node.offsetHeight);
    const id = parseInt(result.data[ALayoutContainer.MIME_TYPE], 10);
    console.assert(reference.parent != null);
    const item = reference.parent.root.find(id);
    if (item === reference || item === null) {
      return false;
    }
    return dropLogic(item, reference, area);
  }, (e) => {
    node.dataset.drop = determineDropArea(e.offsetX / node.offsetWidth, e.offsetY / node.offsetHeight);
  }, true);
}

function dropLogic(item: ILayoutContainer, reference: ALayoutContainer<any> & ILayoutContainer, area: IDropArea) {
  const parent = reference.parent;
  const canDirectly = parent.canDrop(area);
  if (canDirectly) {
    if (parent.children.indexOf(item) < 0) {
      return parent.place(item, reference, area); //tod
    }
    return false; //already a child
  }
  if (area === 'center') {
    //replace myself with a tab container
    const p = new TabbingLayoutContainer(item.node.ownerDocument, {
      name: `${reference.name}, ${item.name}, ...`
    });
    parent.replace(reference, p);
    p.push(reference);
    p.push(item);
    p.active = item;
    return true;
  }

  //corner case if I'm the child of a tabbing, tab that and not me
  if (parent instanceof TabbingLayoutContainer) {
    return dropLogic(item, parent, area);
  }

  //replace myself with a split container
  const p = new SplitLayoutContainer(item.node.ownerDocument, {
    orientation: (area === 'left' || area === 'right') ? EOrientation.HORIZONTAL : EOrientation.VERTICAL,
    name: (area === 'left' || area === 'top') ? `${item.name}|${reference.name}` : `${reference.name}|${item.name}`
  });
  parent.replace(reference, p);
  if (area === 'left' || area === 'top') {
    p.push(item, -1, 0.5);
    p.push(reference, -1, 0.5);
  } else {
    p.push(reference, -1, 0.5);
    p.push(item, -1, 0.5);
  }
  return true;
}