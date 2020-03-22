const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const nunjucksRender = require('gulp-nunjucks-render');
const sass = require('gulp-sass');

// set reload from browserSync
const reload = browserSync.reload;

// environment handling
const environment = process.env.NODE_ENV;
const prod = environment === 'production';
const directory = prod ? 'static_prod' : 'static_dev';

// task handling per environment
const sharedTasks = ['clean', 'fonts', 'sass', 'compileHTML'];
const devTasks = ['serve'];
const prodTasks = [];

const tasks = prod
  ? sharedTasks.concat(prodTasks)
  : sharedTasks.concat(devTasks);

gulp.task('clean', () => {
  return del(['static_dev/**/*', 'static_prod/**/*']);
});

gulp.task('sass', () => {
  return gulp
    .src('./src/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest(`./${directory}/css`));
});

gulp.task('compileHTML', () => {
  return gulp
    .src('./src/html/pages/**/*.nunjucks')
    .pipe(
      nunjucksRender({
        path: './src/html/templates',
      })
    )
    .pipe(gulp.dest(`./${directory}`));
});

gulp.task('fonts', () => {
  return gulp.src('./src/fonts/**/*').pipe(gulp.dest(`./${directory}/fonts`));
});

// static server
gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: `./${directory}`,
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
  });

  // watch for changes to specific files and re-compile
  gulp.watch('src/html/**/*.nunjucks', gulp.parallel('compileHTML'));
  gulp.watch('src/scss/**/*.scss', gulp.parallel('sass'));

  // on directory change, reload browserSync
  gulp.watch(`./${directory}/**/*.(css|html)`).on('change', reload);
});

// build tasks depending on environment
gulp.task('build', gulp.parallel(tasks));
