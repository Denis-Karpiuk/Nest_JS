import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { GetQuestionsQueryParamsDto } from '../api/input-dto/get-questions-query-params.input.dto';
import { QuestionViewDto } from '../api/view-dto/question.view-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { PublishedStatuses } from '../api/input-dto/published-statuses';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<Question> {
    const question = await this.questionsRepository
      .createQueryBuilder('question')
      .where('question.id = :id', { id })
      .getOne();

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Question not found',
        extensions: [
          {
            field: 'questionId',
            message: 'Question not found',
          },
        ],
      });
    }

    return question;
  }

  async getAllQuestions(
    query: GetQuestionsQueryParamsDto,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const qb = this.questionsRepository
      .createQueryBuilder('question')
      .skip(query.calculateSkip())
      .take(query.pageSize);

    const bodySearchTerm = query.bodySearchTerm;
    if (bodySearchTerm) {
      qb.andWhere('question.body ILIKE :term', {
        term: `%${bodySearchTerm}%`,
      });
    }

    const publishedStatus = query.publishedStatus;
    if (publishedStatus === PublishedStatuses.Published) {
      qb.andWhere('question.published = :published', {
        published: true,
      });
    }

    if (publishedStatus === PublishedStatuses.NotPublished) {
      qb.andWhere('question.published = :published', {
        published: false,
      });
    }

    const sortDir = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`question.${query.sortBy}`, sortDir);

    const [questions, totalCount] = await qb.getManyAndCount();
    const items = questions.map(QuestionViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
