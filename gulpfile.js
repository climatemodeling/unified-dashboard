/* 
  This is a gulpfile.js for building the LMTUD
  JS app using gulp
*/
var gulp = require('gulp');
var cleanCss = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var insert = require('gulp-insert');
var include = require('gulp-include');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');


var fs = require('fs');

var cssimport = require("gulp-cssimport");


var version = "1.0.0";

var copyrightheader = "/** \n \
   LMTUD v" + version + " (c) Min Xu the ORNL Land Model Testbed (LMT) LDRD project, and US Department of Energy RUBISCO Science Focus Area \n \
   @license BSD-3-Clause \n */ \n";

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


//build js
gulp.task('build-js', function () {

  // add the copyright notice manually
  var apps = ["slideout", "emitter", "decouple"];
  //var lics = JSON.parse(fs.readFileSync("./dist/LICENSE.checker"));

  for (var key of Object.keys(lics)) {
      const ctext = "/*! \n " + key.replace("@", " v") + " Copyright (c) " + lics[key].publisher + "\n" + 
                 "* @license " + lics[key].licenses + "\n" + 
          "* For the full copyright and license information, \n" + 
          "* please read LICENSE.dependencies and LICENSE that was distributed " + 
          "* with this code in the dist directory \n  */ \n";
      if ( key.split('@')[0] == "emitter" ) {
         gulp.src("./node_modules/" + key.split('@')[0] + "/dist/index.js")
             .pipe(insert.prepend(ctext))
             .pipe(gulp.dest("./node_modules/" + key.split('@')[0] + "/dist/"), {overwrite:true});
      }
      if ( key.split('@')[0] == "decouple" || key.split('@')[0] == "slideout" ) {
         gulp.src("./node_modules/" + key.split('@')[0] + "/index.js")
             .pipe(insert.prepend(ctext))
             .pipe(gulp.dest("./node_modules/" + key.split('@')[0] + "/"), {overwrite:true});
      }
  };

  return browserify({entries:['assets/js/lmt_tab.js']})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(rename('lmtud_bundle.js'))
    .pipe(insert.prepend(copyrightheader))
    .pipe(rename('lmtud_bundle.min.js'))
    .pipe(buffer()) 
    .pipe(include())
    .pipe(uglify({
        output: {
            beautify: true,
            //comments: "/^\/*!|^\/\*.*Select2|^'\/\*'*/m"
            comments: "/^!|\\bSelect2\\b|\\blicense\\b|\\btabulator\\b/i"
        }
    }))
    .pipe(gulp.dest('dist/js'))
    .pipe(gulp.dest('public/build/js'));
});

gulp.task('build-css', function () {  
  return gulp.src('assets/css/lmtstyle.css')
    .pipe(cssimport({skipComments:false}))
    .pipe(rename('lmtud_bundle.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('public/build/css'))
    .pipe(rename('lmtud_bundle.min.css'))
    .pipe(cleanCss({specialComments: 1}))
    //.pipe(insert.prepend(copyrightheader))
    .pipe(gulp.dest('dist/css'))
    .pipe(gulp.dest('public/build/css'));
});


gulp.task('deploy', function () {
  return gulp.src(['assets/html/index.html'])
    .pipe(gulp.dest('dist'));
});

gulp.task('licenses', function () {

  gulp.src(['LICENSE'])
    .pipe(gulp.dest('dist'));
  
  return gulp.src(['LICENSE.dependencies'])
    .pipe(include())
    .pipe(gulp.dest('dist'));
});




gulp.task('watch', function() {
  gulp.watch('assets/js/**/*.js', ['pack-js']);
  gulp.watch('assets/css/**/*.css', ['pack-css']);
});

//gulp.task('default', gulp.series(gulp.parallel('clean-js', 'clean-css'), 'build-js', 'build-css'));
gulp.task('default', gulp.series(gulp.parallel('clean-js', 'clean-css'), 'build-css', 'build-js', 'deploy', 'licenses'));
//gulp.task('default', gulp.series('build-js', 'build-css', 'deploy'));
//gulp.task('default', gulp.series('deploy'));
