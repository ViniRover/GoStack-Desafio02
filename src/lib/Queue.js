import Bee from 'bee-queue';
import CancellationMail from '../app/Jobs/CancellationMail';
import ProblemCancellation from '../app/Jobs/ProblemCancellation';
import StoreMail from '../app/Jobs/StoreMail';
import redisConfig from '../config/redis';

const jobs = [CancellationMail, ProblemCancellation, StoreMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
