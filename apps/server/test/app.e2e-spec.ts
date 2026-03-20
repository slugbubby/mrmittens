import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { TasksService } from './../src/tasks/tasks.service';

const testStreamer = {
  twitchUsername: 'streamer_login',
  displayName: 'Streamer Display',
};

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;

  const tasksService = {
    getOverlayTasks: jest.fn().mockResolvedValue({
      tasks: [
        {
          displayNumber: 1,
          id: 'task-1',
          text: 'Ship the OBS overlay',
          createdAt: '2026-01-01T00:00:00.000Z',
          user: {
            id: 'user-1',
            displayName: testStreamer.displayName,
            twitchUsername: testStreamer.twitchUsername,
          },
        },
      ],
      groups: [
        {
          user: {
            id: 'user-1',
            displayName: testStreamer.displayName,
            twitchUsername: testStreamer.twitchUsername,
          },
          tasks: [
            {
              displayNumber: 1,
              id: 'task-1',
              text: 'Ship the OBS overlay',
              createdAt: '2026-01-01T00:00:00.000Z',
              user: {
                id: 'user-1',
                displayName: testStreamer.displayName,
                twitchUsername: testStreamer.twitchUsername,
              },
            },
          ],
        },
      ],
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TasksService)
      .useValue(tasksService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/tasks (GET)', () => {
    return request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect(({ body }) => {
        expect(body.tasks).toHaveLength(1);
        expect(body.groups).toHaveLength(1);
        expect(body.tasks[0].displayNumber).toBe(1);
      });
  });
});
