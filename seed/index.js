'use strict';
var _ = require('lodash');
var yeoman = require('yeoman-generator');
var path = require('path');
var yosay = require('yosay');
var elementNameValidator = require('validate-element-name');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.argument('element-name', {
      desc: 'Tag name of the element and directory to generate.',
      required: true,
    });

    this.option('skip-install', {
      desc: 'Whether bower dependencies should be installed',
      defaults: false,
    });

    this.option('skip-install-message', {
      desc: 'Whether commands run should be shown',
      defaults: false,
    });
  },
  validate: function () {
    this.elementName = this['element-name'];
    var result = elementNameValidator(this.elementName);

    if (!result.isValid) {
      this.emit('error', new Error(chalk.red(result.message)));
    }

    if (result.message) {
      console.warn(chalk.yellow(result.message + '\n'));
    }

    return true;
  },
  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Out of the box I follow the seed-element pattern.'));

    var prompts = [{
        name: 'includeWCT',
        message: 'Would you like to include web-component-tester?',
        type: 'confirm'
      }
    ];

    this.prompt(prompts, function (props) {
      this.includeWCT = props.includeWCT;
      done();
    }.bind(this));

  },
  seed: function () {
    // Construct the element as a subdirectory.
    this.destinationRoot(this.elementName);

    this.log(yosay('Seed generator'));

    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
    this.copy('bowerrc', '.bowerrc');
    this.template('bower.json', 'bower.json');
    this.template('package.json', 'package.json');
    this.copy('jshintrc', '.jshintrc');
    this.copy('gulpfile.js', 'gulpfile.js');
    this.copy('editorconfig', '.editorconfig');
    this.template('seed-element.html', this.elementName + '.html');
    this.template('seed-element.scss', this.elementName + '.scss');
    this.template('index.html', 'index.html');
    this.template('demo/index.html', 'demo/index.html');
    this.template('README.md', 'README.md');
    if (this.includeWCT) {
      this.template('test/index.html', 'test/index.html');
      this.template('test/basic-test.html', 'test/basic-test.html');
      this.template('test/tests.html', 'test/tests.html');
      this.template('test/seed-element-basic.html',
                    'test/' + this.elementName + '-basic.html');

    }
  },
  install: function () {
    this.installDependencies({
      npm: false,
      skipInstall: this.options['skip-install'],
      skipMessage: this.options['skip-install-message'],
    });
  }
});
