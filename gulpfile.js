const gulp = require('gulp');
const inlinesource = require('gulp-inline-source');
const replace = require('gulp-replace');

gulp.task('default', () => {
  return gulp
    .src('./build/*.html')  // Adjust path to your built HTML file
    .pipe(replace('.js"></script>', '.js" inline></script>'))
    .pipe(replace('rel="stylesheet">', 'rel="stylesheet" inline>'))
    .pipe(inlinesource({
      compress: false,
      ignore: ['png'],  // Adjust according to asset types
    }))
    .pipe(gulp.dest('./build'));
});
