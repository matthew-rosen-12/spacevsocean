class Player {
  constructor(id, name, inventory, specials) {
    const playerColor = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
    const degrees = Math.floor(Math.random() * 3) *90 +90;
    this.color = playerColor;
    this.id = id;
    this.score = 0;
    this.degrees = degrees;
    this.inventory = inventory;
    this.specials = specials;
    this.name = name;
  }

  increaseScore(){
    this.score += 1;
  }

  removeFromInventory(image_name){
    this.inventory = this.inventory.filter(e => e !== image_name);
  }

  removeFromSpecials(id){
    this.specials = this.specials.filter(e => e.id !== id);
  }

}

module.exports = Player;