import { UserEntity } from "../../entities/UserEntity";
import { IUserRepository } from "../../repositories/UserRepository";


export default class FindByIdUser {
  private readonly userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
  async execute(id: string): Promise<UserEntity | null> {
    if (!id) {
      throw new Error("ID do usuário é obrigatório");
    }
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return user;
  }
}
