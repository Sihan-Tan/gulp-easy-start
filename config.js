module.exports = {
    srcPath: "src",
    tmpPath: "__temp__",
    distPath: "dist",
    less: true,
    scss: true,
    swig: true,
    babel: true,
    build: {
        htmlmin: true,
        cssmin: true,
        jsMin: true,
        base64: 10 * 1024, // byte 使用css中图片相对路径
        cssSourceMap: true,
        jsSourceMap: true,
        cdn: "",  // 上线环境的前缀, 默认以当前src目录为根目录
        versionHash: true  // 版本hash
    },
    proxyTable: {
        "/api": "http://localhost:3000"
    }
}