import { SchedulerController } from "./scheduler.controller";
import { SchedulerService } from "./scheduler.service";

export const makeSchedulerController = () => {
  return new SchedulerController();
};

export { SchedulerController, SchedulerService };