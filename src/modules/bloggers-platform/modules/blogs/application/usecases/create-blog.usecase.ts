import type { BlogModelType } from './../../domain/blog.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blog.entity';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Types } from 'mongoose';

export class CreateBlogCommand {
  constructor(public readonly dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  Types.ObjectId
> {
  constructor(
    @InjectModel(Blog.name)
    private readonly BlogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<Types.ObjectId> {
    const blogEntity = this.BlogModel.createInstance(command.dto);

    await this.blogsRepository.save(blogEntity);

    return blogEntity._id;
  }
}
