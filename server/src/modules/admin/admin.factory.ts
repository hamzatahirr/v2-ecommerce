import { AdminRepository } from "./admin.repository";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";

export const makeAdminController = () => {
  const repository = new AdminRepository();
  const service = new AdminService(repository);
  return new AdminController(service);
};

