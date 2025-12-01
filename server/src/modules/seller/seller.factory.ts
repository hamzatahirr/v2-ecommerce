import { SellerRepository } from "./seller.repository";
import { SellerService } from "./seller.service";
import { SellerController } from "./seller.controller";

export const makeSellerController = () => {
  const repository = new SellerRepository();
  const service = new SellerService(repository);
  return new SellerController(service);
};

