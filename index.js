let log = require('@sled/log');
let slug = require('to-slug-case');

module.exports = class Core {
  constructor($slider) {
    this.$ = $slider;
    this.domModules = {};
    this.modules = {};
    this.id = $slider.id || 'slider';

    log({ id: this.id }, `created`);
    this.loadDomModules(...this.$.children);
  }

  getModule(name, type) {
    let module;

    this.module(name, (er, bundle) =>
      module = bundle[type == '$' ? type : '_']);

    return module;
  }

  module(name, cb) {
    let bundle;
    let err;

    name = slug(name);

    if (this.modules[name])
      bundle = Object.assign(this.modules[name], { $: this.domModules[name] || null });
    else
      err = new Error('missing module', name);

    cb && cb(err, bundle);
    return new Promise((res, rej) => bundle ? res(bundle) : rej(err));
  }

  loadModules(...modules) {
    if (!modules.length)
      log(`[${this.id}]`, '[modules]', '0 modules to load');
    else modules.forEach(Module => {
      let name = slug(Module.name);
      log(`[${this.id}]`, '[modules]', 'loaded', name);
      this.modules[name] = new Module(this);
    });

    return new Promise(res => res(this));
  }

  loadDomModules(...modules) {
    modules.forEach(domModule => {
      this.domModules[domModule.className] = domModule;
      log(`[${this.id}]`, '[modules-dom]', `loaded ${domModule.className}`);
    });
  }
};
