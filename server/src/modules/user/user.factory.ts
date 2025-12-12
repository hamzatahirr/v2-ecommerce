import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { VerificationService } from './verification.service';
import { ProductService } from '../product/product.service';
import { ProductRepository } from '../product/product.repository';
import { AttributeRepository } from '../attribute/attribute.repository';
import { VariantRepository } from '../variant/variant.repository';

export const makeUserController = () => {
  const repository = new UserRepository();
  const verificationService = new VerificationService();
  const service = new UserService(repository, verificationService);
  return new UserController(service);
};