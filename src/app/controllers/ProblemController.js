import * as Yup from 'yup';

import Problem from '../models/Problem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import ProblemCancellation from '../Jobs/ProblemCancellation';

class ProblemController {
  async index(req, res) {
    const { delivery_id } = req.params;

    if (delivery_id) {
      const orderProblems = await Problem.findAll({
        where: {
          delivery_id,
        },
        attributes: ['description'],
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['product', 'start_date'],
            include: [
              {
                model: Deliveryman,
                as: 'deliveryman',
                attributes: ['name', 'email'],
              },
            ],
          },
        ],
      });

      return res.json(orderProblems);
    }

    const allProblems = await Problem.findAll({
      attributes: ['description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['product', 'start_date'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    return res.json(allProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      delivery_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { delivery_id, description } = req.body;

    const orderExist = Order.findByPk(delivery_id);

    if (!orderExist) {
      return res.status(400).json({ error: 'Order does not exist' });
    }

    const { canceled_at } = orderExist;

    if (canceled_at != null) {
      return res.status(401).json({ erro: 'This order is already cancelled' });
    }

    const problem = await Problem.create({
      delivery_id,
      description,
    });

    const { id } = problem;

    return res.json({
      id,
      delivery_id,
      description,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const problemExist = await Problem.findByPk(id);

    if (!problemExist) {
      return res.status(400).json({ error: 'This problem does not exist' });
    }

    const { delivery_id, description } = problemExist;

    const order = await Order.findByPk(delivery_id, {
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
      return res.status(400).json({ error: 'This order does not exist' });
    }

    const { canceled_at } = order;

    if (canceled_at != null) {
      return res.status(401).json({ error: 'This order is already cancelled' });
    }

    const new_canceled_at = new Date();

    await order.update({
      canceled_at: new_canceled_at,
    });

    Queue.add(ProblemCancellation.key, {
      order,
      description,
    });

    return res.json(order);
  }
}

export default new ProblemController();
