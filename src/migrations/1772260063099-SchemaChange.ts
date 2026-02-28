import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaChange1772260063099 implements MigrationInterface {
  name = 'SchemaChange1772260063099';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "some"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "some" boolean NOT NULL`);
  }
}
