'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});


gulp.task('partials', function () {
  return gulp.src([
    paths.src + '/{app,components}/**/*.html',
    paths.tmp + '/{app,components}/**/*.html'
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'buche'
    }))
    .pipe(gulp.dest(paths.tmp + '/partials/'));
});

gulp.task('partials-lib', function() {
  return gulp.src([
    paths.src + '/components/**/*.html',
    paths.tmp + '/components/**/*.html'
  ])
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache('templateCacheHtml.js', {
      module: 'buche',
      root:'components'
    }))
    .pipe(gulp.dest(paths.tmp + '/partials/'));

})

gulp.task('build-lib', ['partials-lib'], function () {
  return gulp.src([
      paths.src + '/app/app.js',
      paths.src + '/components/**/*.js',
      paths.tmp + '/partials/**/*.js'
    ])
      .pipe($.ngAnnotate())
      .pipe($.concat('buche.js'))
      .pipe(gulp.dest(paths.dist + '/'))
      .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});

gulp.task('build-lib-min', ['partials-lib'], function () {
  return gulp.src([
      paths.src + '/app/app.js',
      paths.src + '/components/**/*.js',
      paths.tmp + '/partials/**/*.js'
    ])
      .pipe($.ngAnnotate())
      .pipe($.uglify({preserveComments:$.uglifySaveLicense}))
      .pipe($.concat('buche.min.js'))
      .pipe(gulp.dest(paths.dist + '/'))
      .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src(paths.tmp + '/partials/templateCacheHtml.js', { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: paths.tmp + '/partials',
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets;

  return gulp.src(paths.tmp + '/serve/*.html')
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.replace('../bootstrap-sass-official/assets/fonts/bootstrap', 'fonts'))
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});

gulp.task('images', function () {
  return gulp.src(paths.src + '/assets/images/**/*')
    .pipe(gulp.dest(paths.dist + '/assets/images/'));
});

gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist + '/fonts/'));
});

gulp.task('misc', function () {
  return gulp.src(paths.src + '/**/*.ico')
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('clean', function (done) {
  $.del([paths.dist + '/', paths.tmp + '/'], done);
});

gulp.task('build', ['html', 'images', 'fonts', 'misc']);

gulp.task('build-lib-all',['build-lib','build-lib-min']);
