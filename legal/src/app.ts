import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@thesaas/common-rfp";
import { newSignatureRouter } from "./routes/signature/new";

const app = express();
app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== "test", DEVELOPMENT MODE
    secure: true,
  })
);

app.use(currentUser);

app.use(newSignatureRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
