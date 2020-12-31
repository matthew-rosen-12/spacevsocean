class Image {
  constructor(index, name, cord) {
    this.id= index;
    this.name = name;
    this.cord = cord;
    this.rotation = 0;
    this.flip = 0;
  }

  rotate(degrees){
    this.rotation = (this.rotation+degrees)%360;
  }

  updateCord(cord){
    this.cord = cord;
  }

}

module.exports = Image;