/*global describe, beforeEach, it*/

var path    = require('path');
var helpers = require('yeoman-generator').test;
var assert  = require('yeoman-generator').assert;

describe('yo polymer:element test', function () {

  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(__dirname, './tmp'))
      .withArguments(['--skip-install'])
      .withPrompt({
        includeCore: false,
        includePaper: false,
        includeSass: false,
        includeLibSass: false,
        includeWCT: true
      })
      .on('end', done);
  });

  before(function (done) {
    helpers.run(path.join(__dirname, '../element'))
      .inDir(path.join(__dirname, './tmp'))
      .withArguments(['x-foo'])
      .withPrompt({
        externalStyle: true,
        includeImport: false
      })
      .on('end', done);
  });

  it('creates expected files', function () {
    var expected = [
      'app/elements/x-foo/x-foo.html',
      'app/elements/x-foo/x-foo.css'
    ];

    assert.file(expected);
  });

});
