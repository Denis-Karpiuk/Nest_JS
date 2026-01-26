import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatusEnum } from '../../../likes/domain/dto/like-status-enum';

export class LikePostInputDto {
  @IsNotEmpty()
  @IsEnum(LikeStatusEnum)
  likeStatus: LikeStatusEnum;
}
