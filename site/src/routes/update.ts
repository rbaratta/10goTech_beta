import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  requireSitePermission,
  validateRequest,
} from "@thesaas/common-rfp";
import { Site } from "../models/site";
import { SiteUpdatedPublisher } from "../events/publishers/site-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/site/:oldTitle",
  requireAuth,
  [
    body("title")
      .notEmpty()
      .matches(/^[a-zA-Z0-9-]+$/)
      .withMessage(
        "A unique title must be provided. No spaces are allowed. Only alphanumeric characters and '-'"
      ),
    body("homeTitle")
      .notEmpty()
      .withMessage("The home title must be provided."),
    body("tagline").notEmpty().withMessage("The tagline must be provided."),
    body("aboutUsBlurb")
      .notEmpty()
      .withMessage("The about us blurb must be provided."),
    body("aboutUsTitle")
      .notEmpty()
      .withMessage("The about us title must be provided."),
    body("privacyPolicy")
      .notEmpty()
      .withMessage("The privacy policy  must be provided."),
    body("termsOfService")
      .notEmpty()
      .withMessage("The terms of service must be provided."),
    body("servicesPageSubheadline")
      .notEmpty()
      .withMessage("The servicesPageSubheadline must be provided."),
    body("servicesPageHeadline")
      .notEmpty()
      .withMessage("The servicesPageHeadline  must be provided."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    let {
      title,
      homeTitle,
      tagline,
      aboutUsTitle,
      aboutUsBlurb,
      privacyPolicy,
      termsOfService,
      servicesPageSubheadline,
      servicesPageHeadline,
    } = req.body;

    const site = await Site.findOne({ title: req.params.oldTitle });
    const nameTaken = await Site.findOne({ title });

    if (nameTaken && title !== req.params.oldTitle) {
      throw new BadRequestError(
        "This title has been reserved by another user."
      );
    }

    if (!site) {
      throw new NotFoundError();
    }

    if (site.ownerId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    title = title.toLowerCase();

    site.set({
      title,
      homeTitle,
      tagline,
      aboutUsTitle,
      aboutUsBlurb,
      privacyPolicy,
      termsOfService,
      servicesPageSubheadline,
      servicesPageHeadline,
    });

    await site.save();

    new SiteUpdatedPublisher(natsWrapper.client).publish({
      title: site.title,
      version: site.version,
      id: site.id,
      ownerId: site.ownerId,
    });

    res.status(200).send(site);
  }
);

export { router as updateSiteRouter };
