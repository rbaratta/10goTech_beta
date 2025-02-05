import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@thesaas/common-rfp";
import { newPhotoRouter } from "./routes/new";
import { viewPhotosByProductRouter } from "./routes/view-by-product";
import { deletePhotoRouter } from "./routes/delete";

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

app.use(newPhotoRouter);
app.use(viewPhotosByProductRouter);
app.use(deletePhotoRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
