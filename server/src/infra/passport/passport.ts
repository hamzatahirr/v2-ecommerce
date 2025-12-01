import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "passport-twitter";
import prisma from "@/infra/database/database.config";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/shared/utils/auth/tokenUtils";

export default function configurePassport() {
  // Google Strategy (unchanged)
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? process.env.GOOGLE_CALLBACK_URL_PROD!
            : process.env.GOOGLE_CALLBACK_URL_DEV!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { email: profile.emails![0].value },
          });

          if (user) {
            // if (!user.googleId) {
            //   user = await prisma.user.update({
            //     where: { email: profile.emails![0].value },
            //     data: {
            //       googleId: profile.id,
            //       avatar: profile.photos?.[0]?.value || "",
            //     },
            //   });
            // }
          } else {
            user = await prisma.user.create({
              data: {
                email: profile.emails![0].value,
                name: profile.displayName,
                // googleId: profile.id,
                avatar: profile.photos?.[0]?.value || "",
              },
            });
          }

          const id = user.id;
          const newAccessToken = generateAccessToken(id);
          const newRefreshToken = generateRefreshToken(id);

          return done(null, {
            ...user,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          console.error("Google Strategy error:", error);
          return done(error);
        }
      }
    )
  );

  // Facebook Strategy (unchanged)
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
        callbackURL:
          process.env.NODE_ENV === "production"
            ? process.env.FACEBOOK_CALLBACK_URL_PROD!
            : process.env.FACEBOOK_CALLBACK_URL_DEV!,
        profileFields: ["id", "emails", "name"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { email: profile.emails?.[0]?.value || "" },
          });

          if (user) {
            // if (!user.facebookId) {
            //   user = await prisma.user.update({
            //     where: { email: profile.emails![0].value },
            //     data: {
            //       facebookId: profile.id,
            //       avatar: profile.photos?.[0]?.value || "",
            //     },
            //   });
            // }
          } else {
            user = await prisma.user.create({
              data: {
                email: profile.emails![0].value,
                name: profile.displayName,
                // facebookId: profile.id,
                avatar: profile.photos?.[0]?.value || "",
              },
            });
          }

          const id = user.id;
          const newAccessToken = generateAccessToken(id);
          const newRefreshToken = generateRefreshToken(id);

          return done(null, {
            ...user,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          console.error("Facebook Strategy error:", error);
          return done(error);
        }
      }
    )
  );

  // 🟡 Twitter Strategy (temporarily disabled if keys missing)
  if (
    process.env.TWITTER_CONSUMER_KEY &&
    process.env.TWITTER_CONSUMER_SECRET &&
    process.env.TWITTER_CALLBACK_URL_DEV
  ) {
    passport.use(
      new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY!,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET!,
          callbackURL:
            process.env.NODE_ENV === "production"
              ? process.env.TWITTER_CALLBACK_URL_PROD!
              : process.env.TWITTER_CALLBACK_URL_DEV!,
          includeEmail: true,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            if (!profile || !profile.id) {
              console.error("Twitter profile missing:", profile);
              return done(new Error("Invalid Twitter profile"));
            }

            const email =
              profile.emails?.[0]?.value ||
              `twitter-${profile.id}@placeholder.com`;
            const name =
              profile.displayName ||
              (profile as any).username ||
              `Twitter User ${profile.id}`;
            const avatar = profile.photos?.[0]?.value || "";

            let user = await prisma.user.findUnique({ where: { email } });

            if (user) {
              // if (!user.twitterId) {
              //   user = await prisma.user.update({
              //     where: { email },
              //     data: { twitterId: profile.id, avatar },
              //   });
              // }
            } else {
              user = await prisma.user.create({
                data: { email, name, /* twitterId: profile.id, */ avatar },
              });
            }

            const id = user.id;
            const newAccessToken = generateAccessToken(id);
            const newRefreshToken = generateRefreshToken(id);

            return done(null, {
              ...user,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            });
          } catch (error) {
            console.error("Twitter Strategy error:", error);
            return done(error);
          }
        }
      )
    );
  } else {
    console.warn("⚠️  Twitter login temporarily disabled: missing credentials");
  }
}
