'use strict'

/* Gulp set up
--------------------------------------------------------------------------------- */

const gulp = require('gulp')
const concat = require('gulp-concat')

const serviceWorkerPrecachedFiles = [
    'Contents/*.*',
    'Scripts/*.*',
    'fonts/*.*'
];

const serviceWorkerComponents = [

]




/* Task: Default
--------------------------------------------------------------------------------- */

gulp.task('default', [
    'service-worker:build'
])




/* Task: Generate Service Worker Precaching
--------------------------------------------------------------------------------- */

gulp.task('service-worker:precaching', function (callback) {
    var path = require('path')
    var swPrecache = require('sw-precache')

    swPrecache.write(path.join('service_worker_components', 'precaching.js'), {
        staticFileGlobs: serviceWorkerPrecachedFiles
    }, callback)
})




/* Task: Generate Service Worker Build
--------------------------------------------------------------------------------- */

gulp.task('service-worker:build', ['service-worker:precaching'], function () {
    return gulp.src([
        'service_worker_components/push-event-handler.js',
        'service_worker_components/precaching.js'
        ])
        .pipe(concat('service-worker.js'))
        .pipe(gulp.dest('./WebPushHelper/WebTester'));
});




/* Task: Watch
--------------------------------------------------------------------------------- */

gulp.task('watch', ['default'], () => {
    // Generate service worker
    gulp.watch(serviceWorkerPrecachedFiles, ['service-worker:build'])
})




/* Task: Build
--------------------------------------------------------------------------------- */

gulp.task('build', [
    'service-worker:build'
])
