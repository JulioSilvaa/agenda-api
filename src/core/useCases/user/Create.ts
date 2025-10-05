import { UserEntity } from "../../entities/UserEntity";
import IUserRepository from "../../repositories/UserRepository";

export default class CreateUser {
  private readonly userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(input: UserEntity): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("Já existe um usuário com este email");
    }
    const user = UserEntity.create(input);
    await this.userRepository.create(user);
  }
}
