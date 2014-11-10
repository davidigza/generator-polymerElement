'use strict';
var yeoman = require('yeoman-generator');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  askFor: function () {
    var done = this.async();

    var includeSass = this.config.get('includeSass');
    var Elem;

    var prompts = [
      {
        name: 'confirm',
        message: 'do you want to generate a polymer element?!',
        type:'confirm'
      }
    ];

    this.prompt(prompts, function (answer) {
      this.Elem = answer.confirm;
      console.log('si/no', this.Elem);
      if(this.Elem){
      done();}
    }.bind(this));
  },
  el: function () {
    this.elementName = this.args[0];
    if (!this.elementName) {
      console.error('Element name required');
      console.error('ex: yo polymer my-element');
      return;
    }

    if (this.elementName.indexOf('-') === -1) {
      console.error('Element name must contain a dash "-"');
      console.error('ex: yo polymer my-element');
      return;
    }

    // Create the template element

    // el = "x-foo/x-foo"
    var elSrc, pathToElSrc;

    var el = path.join(this.elementName, this.elementName);

    var pathToEl = path.join('app/elements', el);

    this.template('_elementf.html', pathToEl + '-test.html');

    elSrc = path.join(this.elementName+'/src',this.elementName);
    pathToElSrc = path.join('app/elements', elSrc);

    this.template('_element.jade', pathToElSrc + '.jade');
    this.template('_element.css', pathToElSrc + '.scss');
    this.template('_element.js', pathToElSrc + '.js');



    // Wire up the dependency in elements.html
    var file = this.readFileAsString('app/elements/elements.html');
    file += '<link rel="import" href="' + elSrc + '.html">\n';
    this.writeFileFromString(file, 'app/elements/elements.html');

  }
});
