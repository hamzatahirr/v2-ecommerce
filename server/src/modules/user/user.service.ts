import AppError from "@/shared/errors/AppError";
import { UserRepository } from "./user.repository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers() {
    return await this.userRepository.findAllUsers();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  async getMe(id: string | undefined) {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  async updateMe(
    id: string,
    data: Partial<{
      name?: string;
      email?: string;
      avatar?: string;
    }>
  ) {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return await this.userRepository.updateUser(id, data);
  }

  async deleteUser(id: string, currentUserId: string) {
    // Prevent self-deletion
    if (id === currentUserId) {
      throw new AppError(400, "You cannot delete your own account");
    }

    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Prevent deletion of last ADMIN
    if (user.role === "ADMIN") {
      const adminCount = await this.userRepository.countUsersByRole(
        "ADMIN"
      );
      if (adminCount <= 1) {
        throw new AppError(400, "Cannot delete the last Admin");
      }
    }

    await this.userRepository.deleteUser(id);
  }

}
