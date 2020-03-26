const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const data = require('gulp-data');
const del = require('del');
const fs = require('fs');
const gulp = require('gulp');
const nunjucksRender = require('gulp-nunjucks-render');
const path = require('path');
const sass = require('gulp-sass');

// set reload from browserSync
const reload = browserSync.reload;

// environment handling
const environment = process.env.NODE_ENV;
const prod = environment === 'production';
const directory = prod ? 'static_prod' : 'static_dev';

// task handling per environment
const sharedTasks = ['clean', 'fonts', 'images', 'sass', 'compileHTML'];
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
  const defaultData = require('./src/html/data/default.json');
  console.log('defaultData', defaultData);

  return gulp
    .src('./src/html/pages/**/*.nunjucks')
    .pipe(
      data((file) => {
        // set path to json file, specific to the HTML page we are compiling!
        const fileName = path.basename(file.path, '.nunjucks');
        const pathToFile = `./src/html/data/${fileName}.json`;
        // let pageData = {};

        console.log('pathToFile', pathToFile);
        console.log('------------------------------');

        // does data file exist?
        if (fs.existsSync(pathToFile)) {
          // delete cache, we always want the latest json data..
          delete require.cache[require.resolve(pathToFile)];
          // log that we are grabbing data
          console.log('grabbing data from: ' + pathToFile);
          // grab specific page data
          const pageData = require(pathToFile);
          console.log('data exists', pageData);
          console.log('======================');
          console.log('======================');
          return pageData;
        } else {
          // const pageData = defaultData;
          console.log('data does not', defaultData);
          console.log('======================');
          console.log('======================');
          return defaultData;
        }
        // set canonical
        // pageData.canonical = `${config.urlBase}${fileName}.html`;

        // return pageData;
      })
    )
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

gulp.task('images', () => {
  return gulp.src('./src/images/**/*').pipe(gulp.dest(`./${directory}/images`));
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
  gulp.watch('src/html/**/*.(json|nunjucks)', gulp.parallel('compileHTML'));
  gulp.watch('src/scss/**/*.scss', gulp.parallel('sass'));

  // on directory change, reload browserSync
  gulp.watch(`./${directory}/**/*.(css|html)`).on('change', reload);
});

// build tasks depending on environment
gulp.task('build', gulp.parallel(tasks));
