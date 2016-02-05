let log = require('@sled/log');
let slug = require('to-slug-case');

module.exports = class Core {
  constructor($slider, ...modules) {
    this.$ = $slider;
    this.id = this.$.id || 'slider';
    this.modules = {};
    this.domModules = {};

    log({ id: this.id }, `created`);

    this.loadDomModules(...this.$.children);
    this.loadModules(...modules);
  }

  module(name) {
    return module = this.modules[name];
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
