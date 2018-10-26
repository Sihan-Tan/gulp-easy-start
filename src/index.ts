class ShowClass {
  name;
  age;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  say(): string {
    return "姓名: " + this.name + ",年龄 : " + this.age;
  }
}

var show = new ShowClass("呵呵", 18);
console.log(show.say());
