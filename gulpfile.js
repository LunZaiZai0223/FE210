const gulp = require('gulp');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const gulpSequence = require('gulp-sequence');
const gulpUglify = require('gulp-uglify');
const inline = require('gulp-inline');
const webpack = require('webpack-stream');
const { series, parallel } = require('gulp');

// gulp.task('minify-css', () => {
//   return gulp.src('./test1.css')
//     .pipe(cleanCSS())
//     .pipe(rename('test1.min.css'))
//     .pipe(gulp.dest('dist'));
// });

// https://awdr74100.github.io/2020-01-28-gulp-upgradegulp/
// https://stackoverflow.com/questions/29298244/gulp-where-is-the-gulp-task-callback-function-defined
// 需要告知 gulp 任務已經完成，需要調用 callback
gulp.task('minify-css', function(callback){
	gulp
	.src('./test1.css')
    .pipe(cleanCSS())
    .pipe(rename('test1.min.css'))
    .pipe(gulp.dest('dist'));
    callback();
});

// gulp.task('compileJS', function(callback){
// 	gulp
// 	.src('./api.js')
// 	.pipe(babel())
// 	.pipe(webpack())
// 	.pipe(gulpUglify())
// 	// 一個檔案需要被多個任務執行？就把任務放在同個區域吧
//  // 但 Webpack 已經做完 bable, webpack, uglify 了...
// 	// https://saffranblog.coderbridge.io/2021/02/25/gulp/
// 	.pipe(rename('api.min.js'))
// 	.pipe(gulp.dest('dist'));
// 	callback();
// });

gulp.task('inline', function(callback){
	gulp
	.src('./index.html')
	.pipe(inline())
	.pipe(rename('index.min.html'))
	.pipe(gulp.dest('./'));
	callback();
});

exports.default = gulp.series('minify-css', 'inline');
// 以上 =
// gulp.task('default', gulp.series(('minify-css', 'inline')));
