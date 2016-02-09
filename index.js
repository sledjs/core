import './index.styl';
import log from '@sled/log';
import slug from 'to-slug-case';

class Core {
    constructor($slider, ...modules) {
    this.$ = typeof $slider == 'object' ? $slider
      : document.querySelector($slider);

    this.modules = {};
    this.domModules = {};
    this.id = this.$.id || 'core';

    log({ id: this.id }, `created`);

    this.loadDomModules(...this.$.children);
    this.loadModules(...modules);
  }

  module(name) {
    return this.modules[name];
  }

  load(name, cb) {
    let module = this.module(slug(name));
    let err;

    if (!module)
      err = new Error('missing module', name);

    cb && cb(err, module);
    return new Promise((res, rej) => module ? res(module) : rej(err));
  }

  bootstrapModule(Module) {
    let name = Module.name;
    let $ = this.domModules[name];
    let module = new Module.class(this);

    if ($) {
      module.$ = $;
      if ($.children.length) {
        module.$$ = $.children;
        this.log('module', name, '$$');
      }

      this.log('module', name, 'inject dom-module');

    } else if (Module.peer === '$') {
      //TODO #3
      throw new Error(`missing dom-module ${name}`);
    }

    this.modules[name] = module;
    module.init && module.init.call(module, this);

    this.log('module', name, 'loaded');
  }

  loadModules(...modules) {
    this.detect('module', modules);
    modules.forEach(this.bootstrapModule.bind(this));

    return new Promise(res => res(this));
  }

  loadDomModules(...modules) {
    this.detect('dom-module', modules);
    modules.forEach(domModule => {
      let name = domModule.classList[0];

      this.domModules[name] = domModule;
      this.log('dom-module', name, 'loaded');
    });
  }

  detect(type, modules) {
    log({ id:this.id, name: type }, `${modules.length} module${modules.length > 1 ? 's' : ''} detected`);
  }

  log(type, name, msg) {
    log({ id: this.id, name: `${type}] [${name}` }, msg);
  }
};

export default Core;
