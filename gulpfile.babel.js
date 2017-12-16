import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';
import gulpSequence from 'gulp-sequence';
const paths = {
    js: ['./**/*.js', '!dist/**', '!node_modules/**', '!public/**'],
    authKey: ['./config/*.p8'],
    certy: ['./config/certificates/*.pem']
};
gulp.task('clean', () =>
    del(['dist/**', '!dist'])
);
gulp.task('transPile', () =>
    gulp.src([...paths.js, '!gulpfile.babel.js'], {base: '.'})
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'))
);
gulp.task('copyAuthKey', () => {
    gulp.src(paths.authKey)
        .pipe(gulp.dest('dist/config'))
});
gulp.task('copyCerty', () => {
    gulp.src(paths.certy)
        .pipe(gulp.dest('dist/config/certificates'))
});
gulp.task('serve', (cb) => {
    gulpSequence('clean', 'transPile', 'copyAuthKey', 'copyCerty')(cb)
});