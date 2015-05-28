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
var util = require('gulp-util');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');

var isNotAutoLogin = function() {
  return !(util.env.user && util.env.pass);
};
var environmentConf = {
  'dev': {
    'base_login_url': 'https://qa-bancamovil.grupobbva.com',
    'sevices_url': '',
    'back_core_url': ''
  },
  'pro': {
    'base_login_url': 'https://bancamovil.grupobbva.com',
    'sevices_url': '',
    'back_core_url': ''
  }
};

var scriptsList = [
    'pgevolution/scripts/config.js',
    'pgevolution/scripts/pgevolution.js'
];

var environment = 'dev';

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

gulp.task('styles', function () {
    return sass('pgevolution/', { sourcemap: true })
    .on('error', function (err) {
      console.error('Error!', err.message);
   })
   .pipe(sourcemaps.write())
   .pipe(gulp.dest('pgevolution/'));
});

gulp.task('components', function () {
  return sass('components/', { sourcemap: true })
  .on('error', function (err) {
    console.error('Error!', err.message);
 })
 .pipe(sourcemaps.write())
 .pipe(gulp.dest('components/'));
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      'pgevolution/scripts/**/*.js',
      'pgevolution/components/**/*.js',
      'pgevolution/components/**/*.html'
    ])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint.extract()) // Extract JS from .html files
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('pgevolution/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (pgevolution)
gulp.task('copy', function () {
  var pgevolution = gulp.src([
    'pgevolution/*',
    '!pgevolution/test',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));

  var bower = gulp.src([
    'components/**/*'
  ]).pipe(gulp.dest('dist/components'));

  var components = gulp.src(['pgevolution/components/**/*.html'])
    .pipe(gulp.dest('dist/components'));

  var vulcanized = gulp.src(['pgevolution/components/components.html'])
    .pipe($.rename('components.vulcanized.html'))
    .pipe(gulp.dest('dist/components'));

  return merge(pgevolution, bower, components, vulcanized).pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['pgevolution/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'pgevolution', 'dist']});

  return gulp.src(['pgevolution/**/*.html', '!pgevolution/{components,test}/**/*.html'])
    // Replace path for vulcanized assets
    .pipe($.if('*.html', $.replace('components/components.html', 'components/components.vulcanized.html')))
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.cssmin()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Vulcanize imports
gulp.task('vulcanize', function () {
  var DEST_DIR = 'dist/components';

  return gulp.src('dist/components/components.vulcanized.html')
    .pipe($.vulcanize({
      dest: DEST_DIR,
      strip: true,
      inline: true
    }))
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.size({title: 'vulcanize'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'components', 'buildIndex', 'builCoreJS'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'pgevolution'],
      routes: {
        '/components': 'components'
      },
      index: (isNotAutoLogin())?'login.html':'index.html'
    }
  });

  gulp.watch(['pgevolution/**/*.html'], reload);
  gulp.watch(['pgevolution/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['pgevolution/components/**/*.{scss,css}'], ['components', reload]);
  gulp.watch(['pgevolution/{scripts,components}/**/*.js'], ['jshint']);
  gulp.watch(['pgevolution/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['envConfig', 'default'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence(
    ['envConfig'],
    ['buildIndex'],
    ['copy', 'styles'],
    'components',
    ['jshint', 'images', 'fonts', 'html'],
    'vulcanize',
    cb);
});

gulp.task('envConfig', function() {
  //improve
  environment = 'pro';
});

//replace in index.html
gulp.task('buildIndex', function () {
  return gulp.src('pgevolution/_index.html')
    .pipe(concat('index.html'))
    .pipe(gulpif(isNotAutoLogin,
      replace(/\/\*LOGIN_START\b\*\/((.|[\r\n])*?)\/\*LOGIN_END\b\*\//g, '')
    ))
    .pipe(gulp.dest('pgevolution/'));
});

gulp.task('builCoreJS', function () {
  if(environment !== 'pro') {
    scriptsList = scriptsList.concat('pgevolution/scripts/loginLib.js');
  }
  return gulp.src(scriptsList)
    .pipe(concat('pgevolution-dist.js'))
    .pipe(replace(/base_login_url/g, environmentConf[environment].base_login_url))
    .pipe(replace(/autologin_value/g, function(){
      return (util.env.user && util.env.pass)?'true':'false';
    }))
    .pipe(replace(/user_value/g, function(){
      return (util.env.user)? ('' + util.env.user).replace(/[',", ]/g, '') || '':'';
    }))
    .pipe(replace(/pass_value/g, function() {
      return (util.env.pass)? ('' + util.env.pass).replace(/[',", ]/g, '') || '' : '';
    }))
    .pipe(gulp.dest('pgevolution/scripts/'));
});



// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', function (cb) {
  // Update the below URL to the public URL of your site
  pagespeed.output('example.com', {
    strategy: 'mobile',
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});


// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
try { require('web-component-tester').gulp.init(gulp); } catch (err) {}

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
