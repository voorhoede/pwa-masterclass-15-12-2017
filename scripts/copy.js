const gulp = require('gulp');

const inputDir = `${__dirname}/../src/`;
const outputDir = `${__dirname}/../cache/`;

gulp.src([
    inputDir + '**/*.json',
    inputDir + '**/*.{gif,ico,jpg,png,svg,webp}',
    inputDir + '**/*.{woff,woff2}'
])
    .pipe(gulp.dest(outputDir));