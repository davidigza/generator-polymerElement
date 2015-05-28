'use strict';
var yeoman = require('yeoman-generator');
var path = require('path');
var yosay = require('yosay');
var chalk = require('chalk');
var elementNameValidator = require('validate-element-name');
var _ = require('lodash');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.argument('project-name', {
      desc: 'Tag name of the project to generate.',
      required: true,
    });

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
      },{
          name: 'includeLogin',
          message: 'Would you like to include login.html?',
          type: 'confirm'
        },
      ];

    this.prompt(prompts, function (answers) {
      this.includeWCT = answers.includeWCT;
      this.includeLogin = answers.includeLogin;
      done();
    }.bind(this));
  },
  updateName: function (name){
    var result, array, len;
    array = name.split('-');
    len=array.length;
    for (var i = 1 ; i < len; i++) {
      result = array[0] + array[i].charAt(0).toUpperCase() + array[i].slice(1);
    }

    return result;
  },
  validate: function () {
    this.projectName = this['project-name'];
    var result = elementNameValidator(this.projectName);

    this.projectName = this.updateName(this.projectName);

    if (!result.isValid) {
      this.emit('error', new Error(chalk.red(result.message)));
    }

    if (result.message) {
      console.warn(chalk.yellow(result.message + '\n'));
    }

    return true;
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
    this.mkdir(this.projectName);
    this.mkdir(this.projectName + '/styles');
    this.mkdir(this.projectName + '/images');
    this.mkdir(this.projectName +'/scripts');
    this.copy('files/404.html', this.projectName + '/404.html');
    this.template('files/styles/main.scss', this.projectName + '/styles/main.scss');
    this.copy('files/scripts/pgevolution.js', this.projectName + '/scripts/pgevolution.js');
    this.copy('files/config/config.json', this.projectName + '/config/config.json');
    this.template('files/scripts/loginLib.js', this.projectName + '/scripts/loginLib.js');
    this.copy('files/htaccess', this.projectName + '/.htaccess');
    this.template('files/index.html', this.projectName + '/index.html');
    this.template('files/_index.html', this.projectName + '/_index.html');
    if (this.includeLogin) {
      this.template('files/login.html', this.projectName + '/login.html');
    }
    this.copy('README.md', 'README.md');
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
