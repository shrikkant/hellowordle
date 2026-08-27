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
import { pool } from './db';
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
    await pool.query(
      `INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, picture = EXCLUDED.picture`,
      [user.id, user.email, user.name, user.picture],
    );

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '30d',
    });
    return { token, user };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: { userId: string }) {
    const { rows } = await pool.query('SELECT id, name, email, picture FROM users WHERE id = $1', [
      req.userId,
    ]);
    if (!rows[0]) throw new UnauthorizedException('Unknown user');
    return rows[0];
  }
}
