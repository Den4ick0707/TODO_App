import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import concat from 'gulp-concat';
import htmlmin from 'gulp-htmlmin';
import browserSync from 'browser-sync';
import del from 'del';

const sass = gulpSass(dartSass);
const bs   = browserSync.create();

const paths = {
    styles: {
        src:   'style/main.scss',
        watch: 'style/**/*.scss',
        dest:  'dist/css',
    },
    scripts: {
        src:  ['js/*.js', 'js/**/*.js'],
        dest: 'dist/js',
    },
    html: {
        src:  'pages/*.html',
        dest: 'dist/html',
    },
};

export async function clean() {
    return del(['dist']);
}

export function styles() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(cleanCSS({ level: 2 }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(bs.stream());
}

export function scripts() {
    return gulp
        .src(paths.scripts.src, { sourcemaps: true })
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(terser())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(bs.stream());
}

export function html() {
    return gulp
        .src(paths.html.src)
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest(paths.html.dest));
}

export function serve() {
    bs.init({
        server: { baseDir: './dist' },
        startPath: '/html/auth.html',
        port: 8080,
        open: true,
        notify: false,
    });

    gulp.watch(paths.styles.watch, styles);
    gulp.watch(paths.scripts.src, scripts).on('change', bs.reload);
    gulp.watch(paths.html.src).on('change', bs.reload);
}

export const build   = gulp.series(clean, gulp.parallel(styles, scripts,html));
export default        gulp.series(build, serve);