import { SellerReviewRepository } from "./seller-review.repository";
import { SellerReviewService } from "./seller-review.service";
import { SellerReviewController } from "./seller-review.controller";

export const makeSellerReviewController = () => {
  const repository = new SellerReviewRepository();
  const service = new SellerReviewService(repository);
  return new SellerReviewController(service);
};

