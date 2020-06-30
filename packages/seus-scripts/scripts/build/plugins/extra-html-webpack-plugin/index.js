const HtmlWebpackPlugin = require('html-webpack-plugin');
const { JSDOM } = require('jsdom');
const conf = require('../../../../conf');
const minify = require('html-minifier').minify;

class ExtraHtmlWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('ExtraHtmlWebpackPlugin', compilation => {
      let hook = HtmlWebpackPlugin.getHooks(compilation);
      hook.beforeEmit.tapAsync('ExtraHtmlWebpackPlugin', (data, cb) => {
        let dom = new JSDOM(data.html),
          document = dom.window.document;
        let assets = this.queryAsset(document);
        assets.forEach(asset => this.processAsset(asset));
        data.html = minify(dom.serialize(), {
          removeComments: true,
          trimCustomFragments: true,
          preserveLineBreaks: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        });
        cb(null, data);
      });
    });
  }

  queryAsset(document) {
    let scriptAsset = document.querySelectorAll('script') || [];
    scriptAsset = Array.prototype.slice.call(scriptAsset);
    let linkAsset = document.querySelectorAll('link');
    linkAsset = Array.prototype.slice.call(linkAsset);
    return scriptAsset.concat(linkAsset);
  }

  processAsset(asset) {
    if (/script/i.test(asset.tagName)) {
      this.processScriptAsset(asset);
    } else {
      this.processLinkAsset(asset);
    }
  }

  processScriptAsset(asset) {
    let src = asset.getAttribute('src');
    if (/^((https?:){0,1}\/\/)/.test(src)) {
      return;
    }
    if (/^\//.test(src)) {
      asset.setAttribute('src', conf.HOST.js ? `//${conf.HOST.js}${src}` : src);
    }
  }

  processLinkAsset(asset) {
    let href = asset.getAttribute('href');
    if (/^((https?:){0,1}\/\/)/.test(href)) {
      return;
    }
    if (/^\//.test(href)) {
      asset.setAttribute(
        'href',
        conf.HOST.css ? `//${conf.HOST.css}${href}` : href
      );
    }
  }
}

module.exports = ExtraHtmlWebpackPlugin;
