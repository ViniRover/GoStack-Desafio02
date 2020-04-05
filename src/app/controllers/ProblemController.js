import * as Yup from 'yup';

import Problem from '../models/Problem';
import Order from '../models/Order';

class ProblemController {
  async index(req, res) {
    return res.json();
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
}

export default new ProblemController();
