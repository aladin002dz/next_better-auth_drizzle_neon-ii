
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
        enabled: true,
        requireEmailVerification: true
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
        async sendVerificationEmail({ user, url = 'https://localhost:3000/verify-email', token = '123456' }, request) {
            try {
                await resend.emails.send({
                    from: process.env.EMAIL_FROM || "hello@marostudio.dev",
                    to: user.email || 'mahfoudh.arous@gmail.com',
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
        /*
                sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string }; url: string }) => {
                    // Log for development
                    console.log('📧 Sending verification email to:', user.email);
                    console.log('🔗 Verification URL:', url);
        
                    // Send email using Resend API directly
                    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
                        try {
                            const code = '123456';
                            const { data, error } = await resend.emails.send({
                                from: process.env.FROM_EMAIL ? `MaroStudio <${process.env.FROM_EMAIL}>` : 'MaroStudio <hello@marostudio.dev>',
                                to: user.email,
                                subject: 'Verify your email address',
                                html: `
                                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                        <h1 style="color: #333; margin-bottom: 20px;">Verify your email address</h1>
                                        <p style="color: #666; line-height: 1.6;">Please use the following code to verify your email address:</p>
                                        <div style="text-align: center; margin: 30px 0;">
                                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; display: inline-block;">
                                                <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #4F46E5;">${code}</span>
                                            </div>
                                        </div>
                                        <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
                                        <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn't request this verification, please ignore this email.</p>
                                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                                            <p>This is an automated message, please do not reply to this email.</p>
                                        </div>
                                    </div>
                                `,
                            });
        
                            if (error) {
                                throw new Error(error.message);
                            }
        
                            return { success: true, data };
                        } catch (error) {
                            console.error('Error sending verification email:', error);
                            throw new Error('Failed to send verification email');
                        }
                    } else {
                        console.log('⚠️  Resend not configured. Add RESEND_API_KEY and EMAIL_FROM to your .env file');
                        console.log('🔗 Verification URL (for development):', url);
                    }
                },
                sendPasswordResetEmail: async ({ user, url }: { user: { email: string; name?: string }; url: string }) => {
                    // Log for development
                    console.log('📧 Sending password reset email to:', user.email);
                    console.log('🔗 Reset URL:', url);
        
                    // Send email using Resend API directly
                    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
                        try {
                            const token = '123456';
                            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
        
                            const { data, error } = await resend.emails.send({
                                from: process.env.FROM_EMAIL ? `MaroStudio <${process.env.FROM_EMAIL}>` : 'MaroStudio <hello@marostudio.dev>',
                                to: user.email,
                                subject: 'Password Reset Request',
                                html: `
                                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                                        <h1 style="color: #333; margin-bottom: 20px;">Password Reset Request</h1>
                                        <p style="color: #666; line-height: 1.6;">You requested a password reset for your account.</p>
                                        <div style="text-align: center; margin: 30px 0;">
                                            <a href="${resetUrl}" 
                                               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                                Reset Password
                                            </a>
                                        </div>
                                        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
                                        <p style="color: #666; font-size: 14px; margin-top: 20px;">If you didn&apos;t request this, please ignore this email.</p>
                                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                                            <p>This is an automated message, please do not reply to this email.</p>
                                        </div>
                                    </div>
                                `,
                            });
        
                            if (error) {
                                throw new Error(error.message);
                            }
        
                            return { success: true, data };
                        } catch (error) {
                            console.error('Error sending password reset email:', error);
                            throw new Error('Failed to send password reset email');
                        }
                    } else {
                        console.log('⚠️  Resend not configured. Add RESEND_API_KEY and EMAIL_FROM to your .env file');
                        console.log('🔗 Reset URL (for development):', url);
                    }
                },*/
    },

    /** if no database is provided, the user data will be stored in memory.
     * Make sure to provide a database to persist user data **/
});
