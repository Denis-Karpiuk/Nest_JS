import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaChange1772260026431 implements MigrationInterface {
  name = 'SchemaChange1772260026431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "some" boolean NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "some"`);
  }
}
