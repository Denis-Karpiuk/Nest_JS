import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaChange1772519954800 implements MigrationInterface {
  name = 'SchemaChange1772519954800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_confirmation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "confirmationCode" character varying NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_ff2b80a46c3992a0046b07c5456" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "isEmailConfirmed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "emailConfirmation"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "emailConfirmation" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isEmailConfirmed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`DROP TABLE "email_confirmation"`);
  }
}
