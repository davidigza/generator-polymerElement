'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
    return sass('./', { sourcemap: false })
    .on('error', function (err) {
      console.error('Error!', err.message);
   })
   .pipe($.autoprefixer({
            browsers:AUTOPREFIXER_BROWSERS
        }))
   .pipe(gulp.dest('./'));
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      '*.html'
    ])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint.extract()) // Extract JS from .html files
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});


// Watch Files For Changes & Reload
gulp.task('serve', ['styles'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: [''],
      routes: {
        'bower_components': 'bower_components'
      },
      index: 'index.html'
    }
  });

  gulp.watch(['*.html'], reload);
  gulp.watch(['./*.{scss, css}'], ['styles', reload]);
  gulp.watch(['*.js'], ['jshint']);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence(
    ['styles'],
    'components',
    ['jshint'],
    cb);
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
try { require('web-component-tester').gulp.init(gulp); } catch (err) {}

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
