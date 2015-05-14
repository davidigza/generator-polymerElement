'use strict';
var yeoman = require('yeoman-generator');
var path = require('path');
var yosay = require('yosay');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.option('skip-install', {
      desc:     'Whether dependencies should be installed',
      defaults: false,
    });

    this.option('skip-install-message', {
      desc:     'Whether commands run should be shown',
      defaults: false,
    });
  },
  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Out of the box I include Polymer Starter Kit'));

    var prompts = [{
        name: 'includeWCT',
        message: 'Would you like to include web-component-tester?',
        type: 'confirm'
      }];

    this.prompt(prompts, function (answers) {
      this.includeWCT = answers.includeWCT;
      done();
    }.bind(this));
  },
  app: function () {
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
    this.copy('bowerrc', '.bowerrc');
    this.copy('bower.json', 'bower.json');
    this.copy('jshintrc', '.jshintrc');
    this.copy('editorconfig', '.editorconfig');
    this.template('gulpfile.js');
    this.template('package.json', 'package.json');
    this.mkdir('pgevolution');
    this.mkdir('pgevolution/styles');
    this.mkdir('pgevolution/images');
    this.mkdir('pgevolution/scripts');
    this.template('pgevolution/404.html');
    this.copy('pgevolution/styles/main.css', 'pgevolution/styles/main.css');
    this.copy('pgevolution/scripts/pgevolution.js', 'pgevolution/scripts/pgevolution.js');
    this.copy('pgevolution/htaccess', 'pgevolution/.htaccess');
    this.copy('pgevolution/index.html', 'pgevolution/index.html');
    this.copy('pgevolution/login.html', 'pgevolution/login.html');
    this.copy('pgevolution/README.md', 'pgevolution/README.md');
    if (this.includeWCT) {
      this.copy('wct.conf.js', 'wct.conf.js');
      this.directory('test', 'test');
    }
  },
  install: function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-install-message'],
    });
  }
});
