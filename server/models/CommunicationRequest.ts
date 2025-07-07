import mongoose from "mongoose";
import {
  ICommunicationRequest,
  communicationRequestSchema,
} from "@shared/communicationSchema";

const CommunicationRequestModel =
  mongoose.models.CommunicationRequest ||
  mongoose.model<ICommunicationRequest>(
    "CommunicationRequest",
    communicationRequestSchema
  );

export default CommunicationRequestModel; 