/**
 * Created by Samuel Gratzl on 19.11.2015.
 */
/// <reference path="../../tsd.d.ts" />
/// <amd-dependency path="bootstrap" />
import $ = require('jquery');
import C = require('../caleydo_core/main');

export function generateDialog(title: string, hide='OK') {
  const dialog = document.createElement('div');
  dialog.setAttribute('role','dialog');
  dialog.classList.add('modal','fade');
  dialog.innerHTML = `
     <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span class="glyphicon glyphicon-remove-sign" title="Close"></span></button>
          <h4 class="modal-title">${title}</h4>
        </div>
        <div class="modal-body">

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">${hide}</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dialog);
  const $dialog = (<any>$(dialog));
  return {
    show: () => $dialog.modal('show'),
    hide: () => $dialog.modal('hide'),
    body: <HTMLElement>dialog.querySelector('.modal-body'),
    footer: <HTMLElement>dialog.querySelector('.modal-footer'),
    onHide: (callback: ()=>void) => $dialog.on('hidden.bs.modal', callback),
    destroy: () => $dialog.remove()
  };
}

export function msg(text: string, category='info'): Promise<void> {
  return new Promise<void>((resolve) => {
    const div = $(`<div class="alert alert-${category} alert-dismissible fade in" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span class="glyphicon glyphicon-remove-sign" title="Close"></span></button>
        ${text}
    </div>`).appendTo('body');
    div.on('closed.bs.alert', resolve);
    (<any>div).alert();
  });
}

/**
 * simple prompt dialog
 * @param text
 * @param options
 * @returns {Promise}
 */
export function prompt(text:string,  options :any = {}):Promise<string> {
  var o = {
    title: 'Input',
    placeholder: 'Enter...',
    multiline: false
  };
  if (typeof options === 'string') {
    options = { title: options};
  }
  C.mixin(o, options);
  return new Promise((resolve) => {
    var dialog = generateDialog(o.title);
    if (o.multiline) {
      dialog.body.innerHTML = `<form><textarea class="form-control" rows="5" placeholder="${o.placeholder}" autofocus="autofocus">${text}</textarea></form>`;
    } else {
      dialog.body.innerHTML = `<form><input type="text" class="form-control" value="${text}" autofocus="autofocus" placeholder="${o.placeholder}"></form>`;
    }
    (<HTMLFormElement>dialog.body.querySelector('form')).onsubmit = () => {
      dialog.hide();
      return false;
    };
    dialog.onHide(() => {
      resolve((<HTMLInputElement>dialog.body.querySelector('input, textarea')).value);
      dialog.destroy();
    });
    dialog.show();
  });
}

/**
 * simple choose dialog
 * @param items
 * @param options
 * @returns {Promise}
 */
export function choose(items:string[], options :any = {}):Promise<string> {
  var o = {
    title :  'Choose',
    placeholder: 'Enter...',
    editable: false
  };
  if (typeof options === 'string') {
    options = { title: options};
  }
  C.mixin(o, options);

  return new Promise((resolve) => {
    var dialog = generateDialog(o.title);
    const option = items.map((d) =>`<option value="${d}">${d}</option>`).join('\n');
    if (o.editable) {
      dialog.body.innerHTML = `<form><input type="text" list="chooseList" class="form-control" autofocus="autofocus" placeholder="${o.placeholder}">
        <datalist id="chooseList">${option}</datalist>
      </form>`;
    } else {
      dialog.body.innerHTML = `<form><select class="form-control">${option}</select></form>`;
    }

    (<HTMLFormElement>dialog.body.querySelector('form')).onsubmit = () => {
      dialog.hide();
      return false;
    };
    dialog.onHide(() => {
      if (options.editable) {
        resolve((<HTMLInputElement>dialog.body.querySelector('input')).value);
      } else {
        resolve(items[(<HTMLSelectElement>dialog.body.querySelector('select')).selectedIndex]);
      }
      dialog.destroy();
    });
    dialog.show();
  });
}

export function areyousure(msg: string, options :any = {}):Promise<boolean> {
  var o = {
    title :  'Are you sure?',
    button: '<span class="glyphicon glyphicon-remove"></span> Delete'
  };
  if (typeof options === 'string') {
    options = { title: options};
  }
  C.mixin(o, options);

  return new Promise((resolve) => {
    var dialog = generateDialog(o.title, 'Cancel');
    dialog.body.innerHTML = msg;
    $('<button class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span> Delete</button>').appendTo(dialog.footer);
    $(dialog.footer).find('button.btn-danger').on('click', function() {
      dialog.destroy();
      resolve(true);
    });
    dialog.onHide(() => {
      dialog.destroy();
      resolve(false);
    });
    dialog.show();
  });
}