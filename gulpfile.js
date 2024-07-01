const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

function compileSass(done) {
  console.log('\nCompiling SCSS...');
  let hasError = false;

  gulp.src('src/scss/**/*.scss')
    .pipe(sass().on('error', function(err) {
      sass.logError.call(this, err);
      hasError = true;
    }))
    .pipe(gulp.dest('dist/css'))
    .on('end', function() {
      if (hasError) {
        console.log('\x1b[31m%s\x1b[0m', "Finished with errors"); // red color
      } else {
        console.log('\x1b[32m%s\x1b[0m', "Finished successfully"); // green color
      }
      done();
    });
}

function watch() {
  console.log('\nWatching SCSS files...');
  gulp.watch('src/scss/**/*.scss', compileSass);
}

// gulp sass - compiles sass files
exports.sass = compileSass;

// gulp watch - watches for changes
exports.watch = watch;

// gulp - sets the default function to run 
exports.default = watch;
