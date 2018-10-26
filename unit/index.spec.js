describe('测试函数的基本api', function() {
    it('+1 函数的应用', function() {
        expect(window.test(1)).toBe(9)
        expect(window.test(15)).toBe(5)
    })
})