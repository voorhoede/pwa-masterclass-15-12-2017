const gulp = require('gulp');
const revReplace = require('gulp-rev-replace');
const path = require('path');

const baseDir = require('../lib/rev-config').outputDir;
const manifestFilename = require('../lib/rev-config').manifestFilename;

const sourceFiles = [
    'service-worker.js'
];

const gulpFiles = sourceFiles.map(filename => path.join(baseDir, filename));

gulp.src(gulpFiles)
    .pipe(revReplace({
        manifest: gulp.src(path.join(baseDir, manifestFilename))
    }))
    .pipe(gulp.dest(baseDir));