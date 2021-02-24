var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var cleanCss = require('gulp-clean-css');
var rev = require('gulp-rev');
var revRewrite = require('gulp-rev-rewrite');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');
var rename = require("gulp-rename");

gulp.task('clean-js', function () {
  return del([
    'public/build/js/*.js', 
    'dist/js/*.js'
  ]);
});

gulp.task('clean-css', function () {
  return del([
    'public/build/css/*.css',
    'dist/css/*.css'
  ]);
});

gulp.task('build-js', function () {
  return browserify({entries:['assets/js/lmt_tab.js'],
    transform: [
        ['babelify'],
        ['browserify-css',{
           minify: true,
           processRelativeUrl: function(relativeUrl) {
               return relativeUrl;
           },
           rebaseUrls:false,
           output: 'public/build/css/lmtud_bundle.min.css'}]
    ]})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(rename('lmtud_bundle.js'))
    .pipe(gulp.dest('public/build/js'))
    .pipe(buffer()) 
    .pipe(minify({
        ext:{
            min:'.min.js'
        },
        noSource: true
    }))
    //.pipe(rev())
    .pipe(gulp.dest('dist/js'))
    .pipe(rev.manifest('rev-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('public/build/js'));
});

gulp.task('build-css', function () {  
  return gulp.src(['public/build/css/lmtud_bundle.min.css'])
    .pipe(cleanCss())
    //.pipe(rev())
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest('rev-manifest.json', {
      merge: true
    }))
    .pipe(gulp.dest('public/build/css'));
});


gulp.task('deploy', function () {
  const manifest1 = gulp.src(['public/build/js/rev-manifest.json'], {allowEmpty: true});
  const manifest2 = gulp.src(['public/build/css/rev-manifest.json'], {allowEmpty: true});
  return gulp.src(['assets/html/index.html'])
    .pipe(revRewrite({ manifest:manifest1 }, {allowEmpty: true}))
    .pipe(revRewrite({ manifest:manifest2 }, {allowEmpty: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('assets/js/**/*.js', ['pack-js']);
  gulp.watch('assets/css/**/*.css', ['pack-css']);
});

//gulp.task('default', gulp.series(gulp.parallel('clean-js', 'clean-css'), 'build-js', 'build-css'));
gulp.task('default', gulp.series(gulp.parallel('clean-js', 'clean-css'), 'build-js', 'build-css', 'deploy'));
//gulp.task('default', gulp.series('build-js', 'build-css', 'deploy'));
//gulp.task('default', gulp.series('deploy'));
