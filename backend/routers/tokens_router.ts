import dotenv from 'dotenv';
import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

export const tokensRouter: Router = Router();
const client = new GoogleGenAI({apiKey: process.env.VITE_GOOGLE_AI_API_KEY});

tokensRouter.get("/", isAuthenticated, async (req, res) => {
    const expireTime = new Date(Date.now() + 180 * 60 * 1000).toISOString(); // Change later to assessment time limit.

    console.log(client);

    const token = await client.authTokens.create({
        config: {
            expireTime: expireTime,
            liveConnectConstraints: {
                model: 'gemini-2.0-flash-exp',
                config: {
                    sessionResumption: {},
                    responseModalities: ['AUDIO'],       // Add more modalities as needed
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Aoede' },
                        },
                    }
                }
            },
            httpOptions: {
                apiVersion: 'v1alpha'
            }
        }
    });

    console.log('🔍 Generated token:', token);

    res.json({ tokenName: token.name });
});