let log = require('@sled/log');
let slug = require('to-slug-case');

module.exports = class Core {
  constructor($slider, ...modules) {
    this.$ = $slider;
    this.domModules = {};
    this.modules = {};
    this.id = $slider.id || 'slider';

    log({ id: this.id }, `created`);

    this.loadModules(...modules);
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

  bootstrapModule(Module) {
    let module = new Module(this);
    let name = slug(module.name);
    let $ = this.domModules[name];

    if ($) module.$ = $;
    this.modules[name] = module;
    log(`[${this.id}]`, '[modules]', 'loaded', name);
  }

  loadModules(...modules) {
    if (!modules.length)
      log(`[${this.id}]`, '[modules]', '0 modules to load');

    else modules.forEach(this.bootstrapModule);
    return new Promise(res => res(this));
  }

  loadDomModules(...modules) {
    modules.forEach(domModule => {
      this.domModules[domModule.className] = domModule;
      log(`[${this.id}]`, '[modules-dom]', `loaded ${domModule.className}`);
    });
  }
};
