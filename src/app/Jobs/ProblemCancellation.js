import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class ProblemCancellation {
  get key() {
    return 'ProblemCancellation';
  }

  async handle({ data }) {
    const { order, description } = data;

    Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Order cancellation',
      template: 'problemcancellation',
      context: {
        deliveryman: order.deliveryman.name,
        recipient: order.recipient.name,
        product: order.product,
        date: format(new Date(), "dd 'de' MMMM', ás' H:mm'h'", {
          locale: pt,
        }),
        problem: description,
      },
    });
  }
}

export default new ProblemCancellation();
