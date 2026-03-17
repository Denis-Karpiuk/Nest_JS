import { Player } from '../../domain/player.entity';

export class PlayerViewDto {
  id: string;
  player: { id: string; login: string };
  answers: [];
  score: number;

  static mapToView(player: Player): PlayerViewDto {
    const dto = new PlayerViewDto();

    dto.player = { id: player.id, login: player.playerAccount.login };
    dto.id = player.id;
    dto.score = player.score;

    return dto;
  }
}

// Game {
//   id: '5994be2e-4c26-48f6-8fe4-23b8e83ab327',
//   firstPlayer: Player {
//     id: 'ebab940b-a3fc-4fdf-8dc3-9dcd319ff8d8',
//     playerAccount: User {
//       id: '9e2fa980-2b9b-4adb-a9cd-a07e32b0dc8a',
//       login: '8XrwoXVmgD',
//       passwordHash: '$2b$10$X4NuI9JT/0CErNNYUHh/E.WBogoMroGiAUrDJsJGxuE7206DkjUzO',
//       email: 'example@example.dev',
//       firstName: '',
//       lastName: '',
//       passwordRecoveryInformation: undefined,
//       createdAt: 2026-03-17T13:34:24.813Z,
//       updatedAt: 2026-03-17T13:34:24.813Z,
//       deletedAt: null,
//       emailConfirmation: undefined,
//       devices: undefined,
//       comments: undefined,
//       likes: undefined
//     },
//     score: 0
//   },
//   secondPlayer: Player {
//     id: 'fdca6a72-45c2-4b1e-a01b-bcddff740d4f',
//     playerAccount: User {
//       id: '9e2fa980-2b9b-4adb-a9cd-a07e32b0dc8a',
//       login: '8XrwoXVmgD',
//       passwordHash: '$2b$10$X4NuI9JT/0CErNNYUHh/E.WBogoMroGiAUrDJsJGxuE7206DkjUzO',
//       email: 'example@example.dev',
//       firstName: '',
//       lastName: '',
//       passwordRecoveryInformation: undefined,
//       createdAt: 2026-03-17T13:34:24.813Z,
//       updatedAt: 2026-03-17T13:34:24.813Z,
//       deletedAt: null,
//       emailConfirmation: undefined,
//       devices: undefined,
//       comments: undefined,
//       likes: undefined
//     },
//     score: 0
//   },
//   questions: [
//     'ddf5be63-3d32-44d0-8e17-573fb86bfcfd',
//     'bd36aa00-ca13-4068-8d05-5065bdfa9417',
//     'bfc0e644-0996-4818-95ee-4813d94ea31a',
//     'bf0be6de-304d-41f3-a2b0-b42cfe037fc0',
//     'a3969eb4-6280-442c-9b2d-ac007fa6dab3'
//   ],
//   status: 'Active',
//   createdAt: 2026-03-17T14:39:01.548Z,
//   startDate: 2026-03-17T17:44:18.810Z,
//   finishDate: null
// }
