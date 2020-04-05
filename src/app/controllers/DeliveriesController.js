import { startOfDay, parseISO, addHours, isAfter, isBefore } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

class DeliveriesController {
  async index(req, res) {
    const { id } = req.params;

    const deliverymanExist = await Deliveryman.findByPk(id);

    const { createdAt } = deliverymanExist;

    if (!deliverymanExist) {
      return res.status(400).json({ error: 'Deliveryman does not exist' });
    }

    const deliveriesInProgress = await Order.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
      },
    });

    const deliveriesEnded = await Order.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: {
          [Op.between]: [createdAt, new Date()],
        },
      },
    });

    return res.json({
      deliveriesInProgress,
      deliveriesEnded,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { order_id } = req.params;

    const orderExist = await Order.findByPk(order_id);

    if (!orderExist) {
      return res.status(400).json({ error: 'This order does not exist' });
    }

    const { start_date } = req.body;

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

    const { id, product, end_date } = await orderExist.update(req.body);

    return res.json({
      id,
      product,
      start_date,
      end_date,
    });
  }
}

export default new DeliveriesController();
