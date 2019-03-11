const gulp = require('gulp');
const less = require('gulp-less');
const varminifyCSS = require('gulp-minify-css')


function parseLess() {
    return gulp.src('./assets/**/*.less')
    .pipe(less())
    .pipe(varminifyCSS())
    .pipe(gulp.dest('./site/assets'))
}

module.exports = parseLess
