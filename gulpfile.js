const gulp = require("gulp");
const path = require("path");
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

const htmlminConfig = {
    removeComments: true,  // 清除HTML注释
    collapseWhitespace: true, // 压缩HTML
    minifyCSS: true, // 压缩页面css
    minifyJS: true, // 压缩页面js
    removeEmptyAttributes: false, // 删除所有空格作属性值 id=" " => 
    removeScriptTypeAttributes: false, // 删除所有 javascript 标签
    removeStyleLinkTypeAttributes: false // 删除所有style标签
};

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
    return gulp.src([`${config.srcPath}/pages/**/*.html`, `${config.srcPath}/index.html`])
            .pipe(plumber())
            .pipe(swig())
            .pipe(htmlmin())
            .pipe(gulp.dest(config.tmpPath))
});

// 编译less 并压缩 css
gulp.task("less", function() {
    return gulp.src([`${config.srcPath}/pages/**/*.less`])
            .pipe(plumber())
            .pipe(less())
            .pipe(postcss())
            .pipe(minifyCSS())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(config.tmpPath + "/pages"));
});

// css 热更新
gulp.task("css", function() {
    return gulp.src([`${config.tmpPath}/pages/**/*.css`])
            .pipe(plumber())
            .pipe(reload({
                stream: true
            }));
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
            .pipe(gulp.dest(config.tmpPath + "/pages"));
});

// move vendor
gulp.task("move_vendor", function() {
    return gulp.src([`${config.srcPath}/_vendor/**/*.*`])
            .pipe(gulp.dest(config.tmpPath + '/_vendor'));
});

// 压缩html
gulp.task("mini_html", function() {
    
});

gulp.task("dev", ["del_tmp", "swig", "less", "babel", "move_vendor"], function() {
    // browserSync.init({
    //     server: {
    //         baseDir: [config.tmpPath],
    //         index: "index.html"
    //     },
    //     middleware,
    //     port: 8888,
    //     online: true
    // });
});