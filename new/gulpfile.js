const gulp = require('gulp');
const less = require('gulp-less');

gulp.task('less', function () {
    return gulp.src('./less/*.less')
        .pipe(less())
        .pipe(gulp.dest('./css'));
});
gulp.task('dev', gulp.series('less', function (cb) {
    gulp.watch('./less/*.less',function() {
        return gulp.src('./less/*.less')
        .pipe(less())
        .pipe(gulp.dest('./css'));
    })
    cb();
}))