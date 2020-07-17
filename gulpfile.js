const { src, dest, task, series, watch, parallel } = require('gulp');
const rm = require('gulp-rm');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-smile-px2rem');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const env = process.env.NODE_ENV;


task('clean', () => {
    console.log(env);
    return src('dist/**/*', { read: false })
        .pipe(rm())
})

task('copy:html', () => {
    return src('src/*.html')
        .pipe(dest('dist'))
        .pipe(reload({ stream: true }));
})

task('copy:pic', () => {
    return src('src/**images/*')
        .pipe(dest('dist'))
        .pipe(reload({ stream: true }));
})

const styles = [
    'node_modules/normalize.css/normalize.css',
    'src/styles/mixins.scss',
    'src/styles/blocks/*.scss'
];

task('styles', () => {
    return src(styles)
        .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(concat('main.scss'))
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(px2rem({
            dpr: 1, // base device pixel ratio (default: 2)
            rem: 16, // root element (html) font-size (default: 16)
            one: false // whether convert 1px to rem (default: false)
        }))
        .pipe(gulpif(env === 'prod', autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        })))
        .pipe(gulpif(env === 'prod', gcmq()))
        .pipe(gulpif(env === 'prod', cleanCSS()))
        .pipe(gulpif(env === 'dev', sourcemaps.write()))
        .pipe(dest('dist'))
        .pipe(reload({ stream: true }));
});

task('scripts', () => {
    return src('src/scripts/*.js')
        .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(concat('main.js', { newLine: ';' }))
        .pipe(gulpif(env === 'prod', babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpif(env === 'prod', uglify()))
        .pipe(gulpif(env === 'dev', sourcemaps.write()))
        .pipe(dest('dist'))
        .pipe(reload({ stream: true }));
});

task('server', () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        },
        open: false
    });
});

task('watch', () => {
    watch('./src/styles/**/*.scss', series('styles'));
    watch('./src/*.html', series('copy:html'));
    watch('./src/scripts/*.js', series('scripts'));
});

task('default',
    series(
        'clean',
        parallel('copy:html', 'copy:pic', 'styles', 'scripts'),
        parallel('watch', 'server')
    )
);

task('build',
    series(
        'clean',
        parallel('copy:html', 'copy:pic', 'styles', 'scripts'))
);