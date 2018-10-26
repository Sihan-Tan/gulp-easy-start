var ShowClass = /** @class */ (function () {
    function ShowClass(name, age) {
        this.name = name;
        this.age = age;
    }
    ShowClass.prototype.say = function () {
        return '姓名: ' + this.name + ',年龄 : ' + this.age;
    };
    return ShowClass;
}());
var show = new ShowClass('呵呵', 18);
console.log(show.say());
