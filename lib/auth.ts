
import { db } from '@/db/db';
import { resend } from '@/lib/resend-client';
import {
    betterAuth
} from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!
        }
    },
    plugins: [nextCookies()],

    emailVerification: {
        sendOnSignUp: true, // Auto-send verification email on signup
        autoSignInAfterVerification: true, // Auto sign-in after verification
        sendVerificationEmail: async ({ user, url }) => {
            try {
                await resend.emails.send({
                    from: `"MaroStudio" <${process.env.EMAIL_FROM}>`,
                    to: user.email,
                    subject: "Verify your email address",
                    html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Welcome!</h2>
                  <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
                  <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                    Verify Email
                  </a>
                  <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                  <p style="color: #666; font-size: 14px; word-break: break-all;">${url}</p>
                </div>
              `,
                })
            } catch (error) {
                console.error("Failed to send verification email:", error)
                throw error
            }
        },
    },
    // Email configuration
    email: {
        sendOnSignUp: true, // Auto-send verification email on signup
    }
});
