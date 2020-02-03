import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init() {
    super.init({
      name: Sequelize.STRING,
      rua: Sequelize.STRING,
      street: Sequelize.STRING,
      complement: Sequelize.STRING,
      state: Sequelize.STRING,
      city: Sequelize.STRING,
      cep: Sequelize.STRING,
    });
  }
}

export default Recipient;
