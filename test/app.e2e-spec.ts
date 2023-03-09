import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'mb@gmail.com',
      password: '123456',
    };

    describe('Signup', () => {
      it('should throw 400 if email is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw 400 if password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw 400 if body is not provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Login', () => {
      it('should throw 400 if email is not provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw 400 if password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw 400 if body not provided', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });

      it('should log in', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('user_access_token', 'access_token');
      });
    });

    describe('Get Profile', () => {
      it('should get the user details', () => {
        return pactum
          .spec()
          .get('/auth/profile')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        link: 'http://localhost:5556/',
        title: 'Prisma Studio',
        description:
          'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content.',
      };

      it('should create a bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .stores('bookmark_id', 'id')
          .expectStatus(201);
      });
    });

    describe('Get Bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark by Id', () => {
      it('should get a bookmarks details', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmark_id}');
      });
    });

    describe('Edit Bookmark', () => {
      const dto: EditBookmarkDto = {
        title: 'Lorem Ipsum',
      };

      it('should edit a bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title);
      });
    });

    describe('Delete Bookmark', () => {
      it('should delete a bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{user_access_token}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
