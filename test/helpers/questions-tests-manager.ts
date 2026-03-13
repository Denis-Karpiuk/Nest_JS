import { HttpStatus, INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CreateQuestionInputDto } from 'src/modules/quiz/modules/questions/api/input-dto/create-question.input.dto';
import { QuestionViewDto } from 'src/modules/quiz/modules/questions/api/view-dto/question.view-dto';
import { GLOBAL_PREFIX } from 'src/setup/global-prefix.setup';
import request from 'supertest';

export class QuestionsTestManager {
  constructor(private readonly app: INestApplication) {}

  async createQuestion(
    body: CreateQuestionInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<QuestionViewDto> {
    const response = await request(this.app.getHttpServer() as Server)
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .send(body)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as QuestionViewDto;
  }

  async getQuestionById(
    id: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<QuestionViewDto | null> {
    const response = await request(this.app.getHttpServer() as Server)
      .get(`/${GLOBAL_PREFIX}/sa/quiz/questions/${id}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    if (statusCode !== 200) return null;
    return response.body as QuestionViewDto;
  }

  async getAllQuestions(
    query?: Record<string, string | number>,
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const response = await request(this.app.getHttpServer() as Server)
      .get(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .query(query || {})
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as PaginatedViewDto<QuestionViewDto[]>;
  }

  async updateQuestion(
    id: string,
    body: CreateQuestionInputDto,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer() as Server)
      .put(`/${GLOBAL_PREFIX}/sa/quiz/questions/${id}`)
      .send(body)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async publishQuestion(
    id: string,
    body: { published: boolean },
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer() as Server)
      .put(`/${GLOBAL_PREFIX}/sa/quiz/questions/${id}/publish`)
      .send(body)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }

  async deleteQuestion(
    id: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.app.getHttpServer() as Server)
      .delete(`/${GLOBAL_PREFIX}/sa/quiz/questions/${id}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }
}
