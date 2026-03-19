import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaChange1773921872697 implements MigrationInterface {
  name = 'SchemaChange1773921872697';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "public"."user_device" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ip" character varying NOT NULL, "title" character varying NOT NULL, "lastActiveDate" TIMESTAMP NOT NULL, "deviceId" character varying NOT NULL, "iat" integer NOT NULL, "exp" integer NOT NULL, "userId" uuid, CONSTRAINT "PK_0232591a0b48e1eb92f3ec5d0d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."blog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "websiteUrl" character varying NOT NULL, "isMembership" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_85c6532ad065a448e9de7638571" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "shortDescription" character varying NOT NULL, "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "blogId" uuid, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "postId" uuid, "commentatorId" uuid, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."like" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "likeStatus" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "postId" uuid, "commentId" uuid, "userId" uuid, CONSTRAINT "PK_eff3e46d24d416b52a7e0ae4159" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."email_confirmation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "confirmationCode" character varying NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "REL_28d3d3fbd7503f3428b94fd18c" UNIQUE ("userId"), CONSTRAINT "PK_ff2b80a46c3992a0046b07c5456" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."password_recovery" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recoveryCode" character varying NOT NULL, "expirationDate" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "REL_f5b57d414cf38032bbbe9ec578" UNIQUE ("userId"), CONSTRAINT "PK_104b7650227e31deb0f4c9e7d4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying NOT NULL, "passwordHash" character varying NOT NULL, "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying NOT NULL, "correctAnswers" text array NOT NULL, "published" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" integer NOT NULL DEFAULT '0', "playerAccountId" uuid, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."game_question" ("id" SERIAL NOT NULL, "questionId" uuid, "gameId" uuid, CONSTRAINT "PK_08867ba249fa9d179d5449d27d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."game" ("id" uuid NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "startDate" TIMESTAMP, "finishDate" TIMESTAMP, "firstPlayerId" uuid, "secondPlayerId" uuid, CONSTRAINT "REL_e2e6d984f70f61e5435c3be619" UNIQUE ("firstPlayerId"), CONSTRAINT "REL_ee762a5104680b6af6cf7b94f6" UNIQUE ("secondPlayerId"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."answer_answerstatus_enum" AS ENUM('Correct', 'Incorrect')`,
    );
    await queryRunner.query(
      `CREATE TABLE "public"."answer" ("questionId" uuid NOT NULL, "answer" character varying NOT NULL, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), "answerStatus" "public"."answer_answerstatus_enum" NOT NULL, "playerId" uuid NOT NULL, CONSTRAINT "PK_a4013f10cd6924793fbd5f0d637" PRIMARY KEY ("questionId", "playerId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user_device" ADD CONSTRAINT "FK_bda1afb30d9e3e8fb30b1e90af7" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."post" ADD CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9" FOREIGN KEY ("blogId") REFERENCES "public"."blog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."comment" ADD CONSTRAINT "FK_2f689407da0fa968dfc922ab3b6" FOREIGN KEY ("commentatorId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."like" ADD CONSTRAINT "FK_3acf7c55c319c4000e8056c1279" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."like" ADD CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a" FOREIGN KEY ("commentId") REFERENCES "public"."comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."like" ADD CONSTRAINT "FK_e8fb739f08d47955a39850fac23" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."email_confirmation" ADD CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."password_recovery" ADD CONSTRAINT "FK_f5b57d414cf38032bbbe9ec578d" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."player" ADD CONSTRAINT "FK_d8a01686b585c3d2fac9bf57c1d" FOREIGN KEY ("playerAccountId") REFERENCES "public"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game_question" ADD CONSTRAINT "FK_0040e663701d18ed9d1c49ecf6b" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game_question" ADD CONSTRAINT "FK_d35bdfc9ff116d456dcad4a580e" FOREIGN KEY ("gameId") REFERENCES "public"."game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game" ADD CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d" FOREIGN KEY ("firstPlayerId") REFERENCES "public"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game" ADD CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61" FOREIGN KEY ("secondPlayerId") REFERENCES "public"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."answer" ADD CONSTRAINT "FK_5c486122f6925ef0e8fefd5fc75" FOREIGN KEY ("playerId") REFERENCES "public"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."answer" DROP CONSTRAINT "FK_5c486122f6925ef0e8fefd5fc75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game" DROP CONSTRAINT "FK_ee762a5104680b6af6cf7b94f61"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game" DROP CONSTRAINT "FK_e2e6d984f70f61e5435c3be619d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game_question" DROP CONSTRAINT "FK_d35bdfc9ff116d456dcad4a580e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."game_question" DROP CONSTRAINT "FK_0040e663701d18ed9d1c49ecf6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."player" DROP CONSTRAINT "FK_d8a01686b585c3d2fac9bf57c1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."password_recovery" DROP CONSTRAINT "FK_f5b57d414cf38032bbbe9ec578d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."email_confirmation" DROP CONSTRAINT "FK_28d3d3fbd7503f3428b94fd18cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."like" DROP CONSTRAINT "FK_e8fb739f08d47955a39850fac23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."like" DROP CONSTRAINT "FK_d86e0a3eeecc21faa0da415a18a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."like" DROP CONSTRAINT "FK_3acf7c55c319c4000e8056c1279"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."comment" DROP CONSTRAINT "FK_2f689407da0fa968dfc922ab3b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."post" DROP CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."user_device" DROP CONSTRAINT "FK_bda1afb30d9e3e8fb30b1e90af7"`,
    );
    await queryRunner.query(`DROP TABLE "public"."answer"`);
    await queryRunner.query(`DROP TYPE "public"."answer_answerstatus_enum"`);
    await queryRunner.query(`DROP TABLE "public"."game"`);
    await queryRunner.query(`DROP TABLE "public"."game_question"`);
    await queryRunner.query(`DROP TABLE "public"."player"`);
    await queryRunner.query(`DROP TABLE "public"."question"`);
    await queryRunner.query(`DROP TABLE "public"."user"`);
    await queryRunner.query(`DROP TABLE "public"."password_recovery"`);
    await queryRunner.query(`DROP TABLE "public"."email_confirmation"`);
    await queryRunner.query(`DROP TABLE "public"."like"`);
    await queryRunner.query(`DROP TABLE "public"."comment"`);
    await queryRunner.query(`DROP TABLE "public"."post"`);
    await queryRunner.query(`DROP TABLE "public"."blog"`);
    await queryRunner.query(`DROP TABLE "public"."user_device"`);
  }
}
