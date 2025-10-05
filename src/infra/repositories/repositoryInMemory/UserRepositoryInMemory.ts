import { UserEntity } from "../../../core/entities/UserEntity";
import IUserRepository from "../../../core/repositories/UserRepository";

export default class UserRepositoryInMemory implements IUserRepository {
  private users: UserEntity[] = [];

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.find((user) => user.id === id);
    return user || null;
  }
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = this.users.find((user) => user.email === email);
    return user || null;
  }
  async findAll(): Promise<UserEntity[]> {
    return Promise.resolve(this.users);
  }
  async create(user: UserEntity): Promise<UserEntity> {
    this.users.push(user);
    return Promise.resolve(user);
  }
  async update(user: UserEntity): Promise<UserEntity> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
      return Promise.resolve(user);
    }
    // esta errado, deveria lançar um erro
    return Promise.resolve(user);
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
    return Promise.resolve();
  }
}
