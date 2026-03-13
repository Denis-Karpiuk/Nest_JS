import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateQuestionInputDto } from 'src/modules/quiz/modules/questions/api/input-dto/create-question.input.dto';
import { QuestionViewDto } from 'src/modules/quiz/modules/questions/api/view-dto/question.view-dto';
import { deleteAllData } from 'test/helpers/delete-all-data';
import { initSettings } from 'test/helpers/init-settings';
import { QuestionsTestManager } from 'test/helpers/questions-tests-manager';

describe('SA Quiz Questions (e2e)', () => {
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;

  const createQuestionBody: CreateQuestionInputDto = {
    body: 'What is 2 + 2?',
    correctAnswers: ['4', 'four'],
  };

  beforeAll(async () => {
    const settings = await initSettings();
    app = settings.app;
    questionsTestManager = settings.questionsTestManager;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should create question and return correct response', async () => {
    const response =
      await questionsTestManager.createQuestion(createQuestionBody);

    expect(response).toMatchObject({
      body: createQuestionBody.body,
      correctAnswers: expect.arrayContaining(createQuestionBody.correctAnswers),
      published: false,
      id: expect.any(String),
      createdAt: expect.any(String),
    });
    expect(response.correctAnswers).toHaveLength(
      createQuestionBody.correctAnswers.length,
    );
    expect(response.updatedAt).toBeNull();
  });

  it('should not create question with invalid body', async () => {
    await questionsTestManager.createQuestion(
      {
        body: 'short',
        correctAnswers: ['a'],
      },
      HttpStatus.BAD_REQUEST,
    );
  });

  it('should get all questions with pagination', async () => {
    const created: QuestionViewDto[] = [];
    for (let i = 1; i <= 5; i++) {
      const q = await questionsTestManager.createQuestion({
        body: `Question body number ${i} here`,
        correctAnswers: [`answer${i}`],
      });
      created.push(q);
    }

    const response = await questionsTestManager.getAllQuestions();

    expect(response.totalCount).toBe(5);
    expect(response.items).toHaveLength(5);
    expect(response.page).toBe(1);
    expect(response.pageSize).toBe(10);
    const ids = new Set(response.items.map((q) => q.id));
    expect(ids.size).toBe(5);
    created.forEach((q) => expect(ids.has(q.id)).toBe(true));
  });

  it('should get all questions with query params', async () => {
    await questionsTestManager.createQuestion(createQuestionBody);
    await questionsTestManager.createQuestion({
      body: 'Another question body',
      correctAnswers: ['x'],
    });

    const response = await questionsTestManager.getAllQuestions({
      pageNumber: 1,
      pageSize: 1,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });

    expect(response.items).toHaveLength(1);
    expect(response.totalCount).toBe(2);
    expect(response.pageSize).toBe(1);
  });

  it('should update question', async () => {
    const question =
      await questionsTestManager.createQuestion(createQuestionBody);
    const updateBody: CreateQuestionInputDto = {
      body: 'Updated question body content',
      correctAnswers: ['updated'],
    };

    await questionsTestManager.updateQuestion(question.id, updateBody);

    const all = await questionsTestManager.getAllQuestions();
    const updated = all.items.find((q) => q.id === question.id);
    expect(updated).toBeDefined();
    expect(updated!.body).toBe(updateBody.body);
    expect(updated!.correctAnswers).toEqual(updateBody.correctAnswers);
    expect(updated!.updatedAt).not.toBeNull();
  });

  it('should not update question if not found', async () => {
    await questionsTestManager.updateQuestion(
      '00000000-0000-0000-0000-000000000000',
      createQuestionBody,
      HttpStatus.NOT_FOUND,
    );
  });

  it('should publish question', async () => {
    const question =
      await questionsTestManager.createQuestion(createQuestionBody);

    await questionsTestManager.publishQuestion(question.id, {
      published: true,
    });

    const all = await questionsTestManager.getAllQuestions();
    const published = all.items.find((q) => q.id === question.id);
    expect(published).toBeDefined();
    expect(published!.published).toBe(true);
    expect(published!.updatedAt).not.toBeNull();
  });

  it('should not publish question if not found', async () => {
    await questionsTestManager.publishQuestion(
      '00000000-0000-0000-0000-000000000000',
      { published: true },
      HttpStatus.NOT_FOUND,
    );
  });

  it('should delete question', async () => {
    const question =
      await questionsTestManager.createQuestion(createQuestionBody);

    await questionsTestManager.deleteQuestion(question.id);

    const all = await questionsTestManager.getAllQuestions();
    expect(all.totalCount).toBe(0);
    expect(all.items).toHaveLength(0);
  });

  it('should not delete question if not found', async () => {
    await questionsTestManager.deleteQuestion(
      '00000000-0000-0000-0000-000000000000',
      HttpStatus.NOT_FOUND,
    );
  });
});
