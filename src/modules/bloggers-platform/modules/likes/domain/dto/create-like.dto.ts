import { LikeStatusEnum } from './like-status-enum';
import { EntityType } from './entity-type.enum';

export class CreateLikeDto {
  entityId: string;
  entityType: EntityType;
  likeStatus: LikeStatusEnum;
  userId: string;
}
