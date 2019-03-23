const gulp = require('gulp');
const less = require('gulp-less');
const cssmin = require('gulp-minify-css');
const {join} = require('path');
const uglify = require('gulp-uglify');
const babel = require("gulp-babel");    // 用于ES6转化ES5

const {ROOT_PATH, OUTPUT_PATH} = require('../meta')

function handleLess() {
    return gulp.src(join(ROOT_PATH, './src/assets/**/*.less'))
        .pipe(less())
        .pipe(cssmin())
        .pipe(gulp.dest(join(OUTPUT_PATH, './assets')));
}

function handleJs() {
    return gulp.src(join(ROOT_PATH, './src/assets/**/*.js'))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest(join(OUTPUT_PATH, './assets')));
}
function other() {
    return gulp.src(join(ROOT_PATH, './src/assets/**/*.!(less|js)')).pipe(gulp.dest(join(OUTPUT_PATH, './assets')));
}
module.exports = gulp.parallel(handleLess, handleJs, other)