const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const browserSync = require("browser-sync").create();
const reload = browserSync.reload();
const babel = require("gulp-babel");
const changed = require("gulp-changed");

// 压缩
const htmlmin = require("gulp-htmlmin");
const less = require("gulp-less");
const minifyCSS = require("gulp-csso");
const postcss = require("gulp-postcss");
const uglify = require("gulp-uglify");
const del = require("del");
const sourcemaps = require("gulp-sourcemaps");

const swig = require("gulp-swig");
const plumber = require("gulp-plumber");
const proxyMiddleware = require("http-proxy-middleware");
const config = require("./config");


// dev
config.srcPath = config.srcPath || "src";
config.tmpPath = config.tmpPath || "__tmp__";

// 删除临时文件
gulp.task("del_tmp", function() {
    del.sync(path.resolve(__dirname, config.tmpPath));
});

const middleware = config.proxyTable && Object.prototype.toString.call(config.proxyTable) === "[object Object]"
    ? Object.keys(config.proxyTable).map(key => proxyMiddleware(key, typeof config.proxyTable[key] === "string"
    ? { target : config.proxyTable[key]}
    : config.proxyTable[key]))
    : [];

// 编译模板文件
gulp.task("swig", function() {
    return gulp.src([`${config.srcPath}/pages/**/*.html`])
            .pipe(plumber())
            .pipe(swig())
            .pipe(htmlmin())
            .pipe(gulp.dest(config.tmpPath))
});

// 编译less 并压缩 css
gulp.task("css", function() {
    return gulp.src([`${config.srcPath}/pages/**/*.less`])
            .pipe(plumber())
            .pipe(less())
            .pipe(postcss())
            .pipe(minifyCSS())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(config.tmpPath));
});

// babel js
gulp.task("babel", function() {
    return gulp.src([`${config.srcPath}/pages/**/*.es6`])
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(changed(config.tmpPath, {
                extension: ".js"
            }))
            .pipe(babel())
            .pipe(uglify({ mangle: false }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(config.tmpPath))
});

gulp.task("default", ["swig", "css", "babel"]);