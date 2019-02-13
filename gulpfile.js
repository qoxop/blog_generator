const gulp = require('gulp');
const through = require('through2');

gulp.task('default', function() {
    gulp.src('src/*.js')
    .pipe(through.obj(function(chunk, enc, cb) {
        console.log(chunk.contents.toString())
        this.push(chunk)
        cb()
    }))
});