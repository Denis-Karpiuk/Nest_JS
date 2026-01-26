import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatusEnum } from '../../../likes/domain/dto/like-status-enum';

export class LikeCommentInputDto {
  @IsNotEmpty()
  @IsEnum(LikeStatusEnum)
  likeStatus: LikeStatusEnum;
}
