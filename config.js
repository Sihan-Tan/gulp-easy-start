module.exports = {
    srcPath: "src",
    tmpPath: "__temp__",
    distPath: "dist",
    less: true,
    scss: true,
    swig: true,
    ts: true,
    babel: true,
    build: {
        htmlmin: true,
        cssmin: true,
        jsMin: true,
        base64: 10 * 1024, // byte 使用css中图片相对路径
        cssSourceMap: true,
        jsSourceMap: true,
        cdn: "",  // 上线环境的前缀, 默认以当前src目录为根目录
        tags: [{    // 需要替换cdn的路径资源
            match: "script[src]",
            attr: "src"
        }, {
            match: "link[href]",
            attr: "href"
        }, {
            match: "img[src]",
            attr: "src"
        }, {
            match: "a[href]",
            attr: "href"
        }],
        ignore: "", // 忽略替换的前缀 如  pages 会忽略以改项开头的 tags
        versionHash: true  // 版本hash
    },
    proxyTable: {
        "/api": "http://localhost:3000",
        "/myApi": {
            target: "http://localhost:3000",
            pathRewrite: {
                "^/myApi": "/api"
            }
        }
    }
}