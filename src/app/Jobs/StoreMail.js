import Mail from '../../lib/Mail';

class StoreMail {
  get key() {
    return 'StoreMail';
  }

  async handle({ data }) {
    const { deliverymanExist, recipientExist, product } = data;

    Mail.sendMail({
      to: `${deliverymanExist.name} <${deliverymanExist.email}>`,
      subject: 'Order stored',
      template: 'store',
      context: {
        deliveryman: deliverymanExist.name,
        recipient: recipientExist.name,
        product,
      },
    });
  }
}

export default new StoreMail();
