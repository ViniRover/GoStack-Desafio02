import {
  startOfDay,
  parseISO,
  addHours,
  isAfter,
  isBefore,
  format,
} from 'date-fns';
import pt from 'date-fns/locale/pt';

import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Notification from '../schemas/Notification';

import Mail from '../../lib/Mail';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const recipientExist = await Recipient.findByPk(recipient_id);

    if (!recipientExist) {
      return res.status(400).json({ error: 'Recipient does not exist' });
    }

    const deliverymanExist = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExist) {
      return res.status(400).json({ error: 'Deliveryman does not exist' });
    }

    const { product } = req.body;

    const order = await Order.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    const { name, cep } = await Recipient.findByPk(recipient_id);

    await Notification.create({
      content: `Nova encomenda foi feita em seu nome por ${name} com CEP de ${cep}`,
      deliveryman: deliveryman_id,
    });

    const { id } = order;

    await Mail.sendMail({
      to: `${deliverymanExist.name} <${deliverymanExist.email}>`,
      subject: 'Order stored',
      template: 'store',
      context: {
        deliveryman: deliverymanExist.name,
        recipient: recipientExist.name,
        product,
      },
    });

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const order = await Order.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
      ],
      limit: 20,
      offset: (page - 1) * 20,
    });
    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, start_date } = req.body;

    const { id } = req.params;

    const orderExist = await Order.findByPk(id);

    if (!orderExist) {
      return res.status(400).json({ error: 'Order does not exist' });
    }

    if (recipient_id) {
      const recipientExist = await Recipient.findByPk(recipient_id);

      if (!recipientExist) {
        return res.status(400).json({ error: 'Recipient does not exist' });
      }
    }

    if (deliveryman_id) {
      const deliverymanExist = await Deliveryman.findByPk(deliveryman_id);

      if (!deliverymanExist) {
        return res.status(400).json({ error: 'Deliveryman does not exist' });
      }
    }

    if (start_date) {
      const startDate = addHours(startOfDay(new Date()), 8);
      const endDate = addHours(startOfDay(new Date()), 18);

      if (
        isBefore(parseISO(start_date), startDate) ||
        isAfter(parseISO(start_date), endDate)
      ) {
        return res.status(400).json({
          error: 'You can only take this product at 8:00 a.m until 6:00 p.m',
        });
      }
    }

    const { product } = await orderExist.update(req.body);

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!order) {
      return res.status(400).json({ error: 'Order does not exist' });
    }

    const canceled_at = new Date();

    await order.update({
      canceled_at,
    });

    const formattedDate = format(canceled_at, "dd 'de' MMMM', ás' H:mm'h'", {
      locale: pt,
    });

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Order cancellation',
      template: 'cancellation',
      context: {
        deliveryman: order.deliveryman.name,
        recipient: order.recipient.name,
        product: order.product,
        date: formattedDate,
      },
    });

    return res.json(order);
  }
}

export default new OrderController();
