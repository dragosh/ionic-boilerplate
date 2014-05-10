var gulp        = require('gulp');
var concat      = require('gulp-concat');
var sass        = require('gulp-sass');
var minifyCss   = require('gulp-minify-css');
var rename      = require('gulp-rename');
var connect     = require('gulp-connect');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var htmlMin     = require('gulp-minify-html');
var browserify  = require('gulp-browserify');
var clean       = require('gulp-clean');
var ngHtml2Js   = require('gulp-ng-html2js');
var ngmin       = require('gulp-ngmin');
var exec        = require('gulp-exec');
var runSequence = require('gulp-run-sequence');
var src = '_client_';
var dist = 'www';

var paths = {
    root: 'www',
    app: {
        styles: [ src + '/styles/scss/**/*.scss'],
        scripts: [ src + '/scripts/src/**/*.js'],
        views: [ src + '/views/**/*.html', src + '/index.html']
    }
};

gulp.task('scripts', function () {
  gulp.src(paths.app.scripts)
    .pipe(browserify())
    .pipe(gulp.dest(src + '/scripts/'))
    .pipe(connect.reload());
});

gulp.task('views', function () {
  gulp.src(paths.app.views)
    .pipe(connect.reload());
});

gulp.task('styles', function(done) {
    gulp.src(paths.app.styles)
        .pipe(sass({
            sourceComments: 'map'
        }))
        .pipe(gulp.dest( src + '/styles/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest( src + '/styles/'))
        .pipe(connect.reload())
        .on('end', done);
});


gulp.task('webserver', function() {
    connect.server({
        root: [ src ], //paths.root,
        livereload: true,
        port: 8000,
        host: 'moovz.app'
    });
});

gulp.task('watch', function() {
    gulp.watch(paths.app.scripts, ['scripts']);
    gulp.watch(paths.app.styles, ['styles']);
    gulp.watch(paths.app.views, ['views']);
});

gulp.task('clean', function(done) {
  gulp.src(dist)
    .pipe(clean({
        force: true
    }).on('end', done));
});

gulp.task('build',['clean','scripts', 'views', 'styles'], function() {

    gulp.src([
        src + '/lib/ionic/**'
    ]).pipe(gulp.dest(dist + '/lib/ionic'));

    gulp.src(src + '/index.html')
        .pipe(htmlMin({
          empty: true,
          spare: true,
          quotes: true
    })).pipe(gulp.dest(dist));

    gulp.src(src + '/scripts/index.js')
        .pipe(ngmin())
        .pipe(uglify())
        .pipe(gulp.dest(dist + '/scripts/'));

    gulp.src(src + '/styles/base.min.css')
        .pipe(gulp.dest(dist + '/styles/'));

    gulp.src(src + '/images/**')
        .pipe(gulp.dest(dist + '/images/'));

});

gulp.task('cordova-build', function(done) {
    var exec = require('child_process').exec;
    exec('cordova build ios', function (err, stdout, stderr) {
        // console.log(stdout);
        // console.log(stderr);
        done(err);
    });
});

gulp.task('cordova-emulate', function(done) {
    var exec = require('child_process').exec;
    exec('cordova emulate ios', function (err, stdout, stderr) {
        // console.log(stdout);
        // console.log(stderr);
        done(err);
    });
});

gulp.task('dev', ['webserver','scripts', 'views', 'styles', 'watch']);

gulp.task('default', function(cb){
    runSequence('build','cordova-build', 'cordova-emulate');
});
