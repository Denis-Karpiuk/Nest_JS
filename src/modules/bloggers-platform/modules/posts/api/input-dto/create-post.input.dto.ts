export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class UpdatePostInputDto extends CreatePostInputDto {}
