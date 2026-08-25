import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { db } from './db';
import { AuthGuard } from './auth.guard';

const googleClient = new OAuth2Client();

@Controller()
export class AuthController {
  @Post('auth/google')
  async googleAuth(@Body() body: { idToken?: string }) {
    if (!body || typeof body.idToken !== 'string' || !body.idToken) {
      throw new BadRequestException('idToken is required');
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new InternalServerErrorException(
        'Server is missing GOOGLE_CLIENT_ID — set it in server/.env (see .env.example)',
      );
    }
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: body.idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }
    if (!payload || !payload.sub) throw new UnauthorizedException('Invalid Google ID token');

    const user = {
      id: payload.sub,
      email: payload.email ?? null,
      name: payload.name ?? null,
      picture: payload.picture ?? null,
    };
    db.prepare(
      `INSERT INTO users (id, email, name, picture) VALUES (@id, @email, @name, @picture)
       ON CONFLICT(id) DO UPDATE SET email=@email, name=@name, picture=@picture`,
    ).run(user);

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '30d',
    });
    return { token, user };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: { userId: string }) {
    const user = db
      .prepare('SELECT id, name, email, picture FROM users WHERE id = ?')
      .get(req.userId);
    if (!user) throw new UnauthorizedException('Unknown user');
    return user;
  }
}
